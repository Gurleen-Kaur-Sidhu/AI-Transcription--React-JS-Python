from flask import Flask, render_template, make_response, jsonify, request, redirect, flash, url_for
import bcrypt
import pymongo
import jwt
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from datetime import datetime,timedelta
import assemblyai as aai
import smtplib
import random
import string
from email.mime.text import MIMEText
from bson.objectid import ObjectId

app = Flask(__name__,template_folder='dist',static_folder='dist/assets')
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# MongoDB Connection
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
dblist = myclient.list_database_names()

if "User" not in dblist:
    mydb = myclient["User"]
    mytable = mydb["User_data_table"]
    otp_collection = mydb["otp_storage"]
else:
    mydb = myclient["User"]
    mytable = db["User_data_table"]
    otp_collection = db["otp_storage"]



smtp_server = "aitranscription7@gmail.com"
smtp_port = 587
sender_email = "aitranscription7@gmail.com"
sender_password = "aitranscription@12345"

app.secret_key = "secretkey"
jwt_secret = "jwtsecretkey" 

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(recipient_email, otp):
    subject = "Your OTP Code"
    body = f"Your OTP is: {otp}. It is valid for 5 minutes."
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = recipient_email

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.route("/request-otp", methods=["POST"])
def request_otp():
    try:
        data = request.get_json()
        email = data["email"]

        otp = generate_otp()
        expiration_time = datetime.now() + timedelta(minutes=5)

        otp_collection.insert_one({
            "email": email,
            "otp": otp,
            "expiration_time": expiration_time
        })

        if send_otp_email(email, otp):
            return jsonify({"message": "OTP sent successfully."})
        else:
            return jsonify({"error": "Failed to send OTP."})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json()
        email = data["email"]
        otp = data["otp"]

        record = otp_collection.find_one({"email": email, "otp": otp})

        if record:
            expiration_time = record["expiration_time"]
            if datetime.now() <= expiration_time:
                return jsonify({"message": "OTP verified successfully."})
            else:
                return jsonify({"error": "OTP has expired."})
        else:
            return jsonify({"error": "Invalid OTP."})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/clean-expired-otps", methods=["POST"])
def clean_expired_otps():
    try:
        otp_collection.delete_many({"expiration_time": {"$lt": datetime.now()}})
        return jsonify({"message": "Expired OTPs deleted."})
    except Exception as e:
        return jsonify({"error": str(e)})

def password_change(email, new_password):
    try:
        hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
        mytable.update_one({"email": email}, {"$set": {"password": hashed_password}})
        return True
    except Exception as e:
        print(f"Error updating password: {e}")
        return False

@app.route("/change-password", methods=["POST"])
def change_password():
    try:
        data = request.get_json()
        email = data.get("email")
        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not email or not current_password or not new_password:
            return jsonify({"error": "Email, current_password, and new_password are required."}), 400

        user = mytable.find_one({"email": email})

        if not user:
            return jsonify({"error": "This email is not registered."}), 404

        stored_password = user["password"]
        if not bcrypt.checkpw(current_password.encode("utf-8"), stored_password):
            return jsonify({"error": "Current password is incorrect."}), 401

        if password_change(email, new_password):
            return jsonify({"message": "Password changed successfully."}), 200
        else:
            return jsonify({"error": "Failed to update the password."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required."}), 400

        user = mytable.find_one({"email": email})

        if not user:
            return jsonify({"error": "This email is not registered."}), 404

        otp = generate_otp()
        expiration_time = datetime.now() + timedelta(minutes=5)

        otp_collection.insert_one({
            "email": email,
            "otp": otp,
            "expiration_time": expiration_time
        })

        if send_otp_email(email, otp):
            return jsonify({"message": "OTP has been sent to your email."}), 200
        else:
            return jsonify({"error": "Failed to send OTP."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        email = data.get("email")
        otp = data.get("otp")
        new_password = data.get("new_password")

        if not email or not otp or not new_password:
            return jsonify({"error": "Email, OTP, and new_password are required."}), 400

        record = otp_collection.find_one({"email": email, "otp": otp})

        if not record or datetime.now() > record["expiration_time"]:
            return jsonify({"error": "Invalid or expired OTP."}), 400

        if password_change(email, new_password):
            otp_collection.delete_one({"_id": record["_id"]})
            return jsonify({"message": "Password reset successfully."}), 200
        else:
            return jsonify({"error": "Failed to reset the password."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Home route
@app.route("/home")
@app.route("/")
def home():
    # return render_template('index.html')
    return jsonify({"message": "Welcome to the Home Page!"})

# Register route
@app.route("/register", methods=["GET","POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if not name or not email or not password or not confirm_password:
        return make_response(jsonify({"error": "Name, Email, Password and Confirm Password are required"}), 400)
    
    if password != confirm_password:
        return make_response(jsonify({"error": "Password and ConfirmPassword do not match"}), 400)

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    if mytable.find_one({"Email": email}):
        return make_response(jsonify({"error": "Email already exists"}), 400)

    try:
        mytable.insert_one({
            "Name": name,
            "Email": email,
            "Password": hashed_password.decode("utf-8")
        })
        return make_response(jsonify({"message": "User signed up successfully"}), 201)
    except Exception as e:
        print(f"Error while inserting user data: {e}")
        return make_response(jsonify({"error": "Failed to sign up user"}), 500)

# Login route
@app.route("/login", methods=["GET","POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    try:

        if not email or not password:
            return make_response(jsonify({"error": "Email and Password are required"}), 400)

        user = mytable.find_one({"Email": email})
        if user:
            # Check if the password matches
            if bcrypt.checkpw(password.encode("utf-8"), user["Password"].encode("utf-8")):
                payload = {
                    "email": email,
                    "exp": datetime.now() + timedelta(hours=24)
                }
                token = jwt.encode(payload, jwt_secret, algorithm="HS256")
                return jsonify({"message": "Logged in successfully!", "access_token": token})
            else:
                return make_response(jsonify({"error": "Incorrect password"}), 401)
        else:
            return make_response(jsonify({"error": "Email not found"}), 404)
    except Exception as e:
        return make_response(jsonify({"message":f"{e}"}))

@app.route("/protected", methods=["GET"])
def protected():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Missing token"}), 401

    try:
        decoded = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        return jsonify({"message": "Access granted", "email": decoded["email"]})
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401



UPLOAD_FOLDER = 'uploads/audio_files'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'flac', 'ogg', 'aac'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

db = myclient["User"]
audio_collection = db["Audio_file"]

aai.settings.api_key = "846133b1100e46b2ae74c7dbb23c8ec2"
transcriber = aai.Transcriber()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        real_filename = secure_filename(file.filename)
        extension_name = real_filename.split('.')
        extension_name = extension_name[1]
    
        timestamp_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
        
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{timestamp_filename}.{extension_name}")
        file.save(file_path)
        
        try:
            transcript = transcriber.transcribe(file_path)
            transcribed_text = transcript.text

            audio_data = {
                'audio_name': real_filename,
                'local_filename': timestamp_filename,
                'upload_time': datetime.now(),
                'transcribed_text': transcribed_text
            }
            audio_collection.insert_one(audio_data)

            return jsonify({
                'message': 'File uploaded and transcribed successfully',
                'audio_name': real_filename,
                'local_filename': timestamp_filename,
                'transcribed_text': transcribed_text
            }), 200
        
        except Exception as e:
            return jsonify({'error': f"Error in transcription: {str(e)}"}), 500

    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == "__main__":
    app.run(debug=True)
