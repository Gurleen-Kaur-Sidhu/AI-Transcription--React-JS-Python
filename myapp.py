from flask import Flask, render_template, make_response, jsonify, request, redirect, flash, url_for,session,send_file
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
from functools import wraps
import stripe
import http
from collections import defaultdict

stripe.api_key = "sk_test_51Qez6kB7YNnzhmOx0h4QEdx5R2ifPzHLRAw3G8RWyURkMNHYvZRnuEhkAYd0QzlhKVZON9BEAamwanNWMbPQ15pv00KhT5Dv2o"
stripe_public_key = "pk_test_51Qez6kB7YNnzhmOx5LBJQDo3nWjZBvdCxz7BMG58FT2o2ika5aDcxdvxlXKzd4z91Rw5VnQuDPACxBG91WLzSLFx00dAKZ28Wc"

app = Flask(__name__,template_folder='dist',static_folder='dist/assets')
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
dblist = myclient.list_database_names()

if "User" not in dblist:
    mydb = myclient["User"]
    
else:
    mydb = myclient["User"]
    
mytable = mydb["User_data_table"]
otp_collection = mydb["otp_storage"]
Role_table = mydb["Role_data"]
User_list_table = mydb["UserList"]
payment_table = mydb["Payment"]
add_user_table = mydb["AddUser"]


smtp_server = "smtp.gmail.com"
smtp_port = 587
sender_email = "parsadrahul832@gmail.com"
sender_password = "rguy vtcg zaps ernh"

app.secret_key = "secretkey"
jwt_secret = "jwtsecretkey" 


plans_collection = mydb["Plans"]

@app.route("/admin/create_plan", methods=["POST"])
def create_plan():
    try:
        data = request.get_json()
        name = data.get("name")
        price = int(data.get("price")) * 100
        currency = data.get("currency", "usd")

        product = stripe.Product.create(name=name)

        price_obj = stripe.Price.create(
            product=product.id,
            unit_amount=price,
            currency=currency,
            recurring={"interval": "month"},
        )

        plans_collection.insert_one({
            "product_id": product.id,
            "price_id": price_obj.id,
            "name": name,
            "price": price / 100,
            "currency": currency
        })

        return jsonify({"message": "Plan created successfully", "product_id": product.id, "price_id": price_obj.id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/plans', methods=['GET'])
def get_plans():
    try:
        plans = stripe.Plan.list(limit=3)
        plan_list = []
        for plan in plans.auto_paging_iter():
            product = stripe.Product.retrieve(plan.product)
            plan_list.append({
                'id': plan.id,
                'amount': plan.amount,
                'currency': plan.currency,
                'interval': plan.interval,
                'product_name': product.name,
            })

        return jsonify({'status': 'success', 'plans': plan_list}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.before_request
def refresh_token_if_needed():
    token = request.headers.get("Authorization")
    if token:
        token = token.replace("Bearer ", "")
        try:
            decoded = jwt.decode(token, jwt_secret, algorithms=["HS256"])
            email = decoded.get("email")
            current_role = decoded.get("role")
            current_role = current_role.lower()

            user = mytable.find_one({"Email": email})
            if not user:
                return jsonify({"error": "User not found"}), 404

            latest_role = user.get("Role")
            temp_role_token = latest_role
            latest_role = latest_role.lower()
            if current_role != latest_role:
                latest_role = temp_role_token
                new_payload = {
                    "email": email,
                    "role": latest_role,
                    "exp": (datetime.now() + timedelta(hours=24)).timestamp()
                }
                new_token = jwt.encode(new_payload, jwt_secret, algorithm="HS256")

                response = make_response(jsonify({"message": "Role updated, token refreshed"}))
                response.headers["Authorization"] = f"Bearer {new_token}"
                response.set_cookie("Authorization", f"Bearer {new_token}", httponly=True, secure=True, samesite="Strict")

                return response
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401



def role_required(roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            token = request.headers.get("Authorization")
            if not token:
                return jsonify({"error": "Missing token"}), 401
            
            try:
                decoded = jwt.decode(token.split(" ")[1], jwt_secret, algorithms=["HS256"])
                user_role = decoded.get("role")
                if user_role not in roles:
                    return jsonify({"error": "Access denied for this role"}), 403
                return func(*args, **kwargs)
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token has expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401
        return wrapper
    return decorator



@app.route("/user-list", methods=["GET"])
@role_required(["Admin"])
def user_list():
    try:
        users = User_list_table.find()
        user_list = []
        for user in users:
            user_list.append({
                "Name" : user["Name"],
                "Email":user["Email"],
                "Role":user["Role"],
                "Status":user["Status"],  
            })

        return jsonify({"users": user_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/user-role", methods=["GET"])
@role_required(["Admin"])
def user_role():
    try:
        users = Role_table.find()
        user_list = []
        for user in users:
            user_list.append({
                "Name": user["Name"],
                "Email": user["Email"],
                "Role": user["Role"],
                "Status": user["Status"],
            })

        return jsonify({"users": user_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
    
@app.route("/edit-user", methods=["PUT"])
@role_required(["Admin"])
def edit_user():
    try:
        data = request.json
        if not data or "Email" not in data:
            return jsonify({"error": "Email field is required"}), 400

        email = data["Email"]
        update_data = {key: data[key] for key in ["Name", "Email", "Role", "Status"] if key in data}

        if not update_data:
            return jsonify({"error": "No valid fields to update"}), 400

        print(f"Attempting to update user with Email: {email}")
        print(f"Update data: {update_data}")

        admin_count = User_list_table.count_documents({"Role": "Admin"})
        if "Role" in update_data and update_data["Role"].lower() != "admin" and admin_count == 1:
            return jsonify({"error": "Cannot remove the last admin"}), 400

        if "Status" in update_data and update_data["Status"].lower() == "inactive":
            logout(email)

        result = mytable.update_one({"Email": email}, {"$set": update_data})
        result2 = User_list_table.update_one({"Email": email}, {"$set": update_data})
        Role_table.update_one({"Email": email}, {"$set": update_data})

        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404

        if result.modified_count == 0:
            return jsonify({"message": "No changes were made"}), 200

        response = jsonify({"message": "User updated successfully"})
        response.delete_cookie("Authorization")
        return response

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/delete-user", methods=["DELETE"])
@role_required(["Admin"])
def delete_user():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required to delete a user."}), 400
        result = mytable.delete_one({"Email": email})
        result2 = User_list_table.delete_one({"Email": email})
        Role_table.delete_one({"Email": email})

        if result.deleted_count > 0:
            return jsonify({"message": f"User with email {email} deleted successfully."}), 200
        else:
            return jsonify({"error": f"No user found with email {email}."}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500



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
    
    
def send_otp_email_for_add_user_route(recipient_email):
    subject = "User created"
    body = f"User created successfully at ai transcription please set your password click on the link : http://localhost:5173/forget"
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
        mytable.update_one({"Email": email}, {"$set": {"Password": hashed_password.decode("utf-8")}})
        return True
    except Exception as e:
        print(f"Error updating password: {e}")
        return False
    
    
def admin_password_change(email, new_password):
    try:
        hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
        admin_mytable.update_one({"email": email}, {"$set": {"password": hashed_password}})
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

        user = mytable.find_one({"Email": email})

        if not user:
            return jsonify({"error": "This email is not registered."}), 404

        stored_password = user["Password"]
        if not bcrypt.checkpw(current_password.encode("utf-8"), stored_password):
            return jsonify({"error": "Current password is incorrect."}), 401

        if password_change(email, new_password):
            return jsonify({"message": "Password changed successfully."}), 200
        else:
            return jsonify({"error": "Failed to update the password."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route("/account/change/password", methods=["POST"])
@role_required(["Admin","User"])
def account_change_password():
    try:
        data = request.get_json()
        email = data.get("Email")
        new_password = data.get("NewPassword")
        confirm_password = data.get("ConfirmPassword")

        if not email or not confirm_password or not new_password:
            return jsonify({"error": "Email, confirm password, and new password are required."}), 400

        user = mytable.find_one({"Email": email})

        if not user:
            return jsonify({"error": "This email is not registered."}), 404

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

        user = mytable.find_one({"Email": email})

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

@app.route("/register", methods=["GET","POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    # Role = data.get("Role")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")
    
    id = 0
    if not name or not email or not password or not confirm_password:
        return make_response(jsonify({"error": "Name, Email, Role,Password and Confirm Password are required"}), 400)
    
    if password != confirm_password:
        return make_response(jsonify({"error": "Password and ConfirmPassword do not match"}), 400)

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    if mytable.find_one({"Email": email}):
        return make_response(jsonify({"error": "Email already exists"}), 400)
    
    try:
        mytable.insert_one({
            "Name": name,
            "Email": email,
            "Role":"Admin",
            "Password": hashed_password.decode("utf-8"),
            "Status":"Active"
        })
        
        
        User_list_table.insert_one({
            "Name": name,
            "Email": email,
            "Role":"Admin",
            "Status":"Active"
        })
        
        Role_table.insert_one({
            "Name": name,
            "Email": email,
            "Role":"Admin",
            "Status":"Active"
        })
        
        return make_response(jsonify({"message": "User signed up successfully"}), 201)
    except Exception as e:
        print(f"Error while inserting user data: {e}")
        return make_response(jsonify({"error": "Failed to sign up user"}), 500)



@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    try:
        if not email or not password:
            return make_response(jsonify({"error": "Email and Password are required"}), 400)

        user = mytable.find_one({"Email": email})
        if user:
            role = user.get("Role")
            if bcrypt.checkpw(password.encode("utf-8"), user["Password"].encode("utf-8")):
                payload = {
                    "email": email,
                    "role": role,
                    "exp": (datetime.now() + timedelta(hours=24)).timestamp()
                }
                token = jwt.encode(payload, jwt_secret, algorithm="HS256")

                response = jsonify({
                    "message": "Logged in successfully!",
                    "token":token,
                    "Name":user.get("Name"),
                    "Email":email,
                    "Role":role
                })
                response.headers["Authorization"] = f"Bearer {token}"
                
                response.set_cookie(
                    "Authorization",
                    f"Bearer {token}",
                    httponly=True,
                    secure=True,
                    samesite="Strict",
                )
                
                return response
            else:
                return make_response(jsonify({"error": "Incorrect password"}), 401)
        else:
            return make_response(jsonify({"error": "Email not found"}), 404)

    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)
    
    
@app.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    try:
        if not email or not password:
            return make_response(jsonify({"error": "Email and Password are required"}), 400)

        user = mytable.find_one({"Email": email})
        if user:
            role = user.get("Role")
            print(role)
            if role == "Admin":
                if bcrypt.checkpw(password.encode("utf-8"), user["Password"].encode("utf-8")):
                    payload = {
                        "email": email,
                        "role": role,
                        "exp": (datetime.now() + timedelta(hours=24)).timestamp()
                    }
                    token = jwt.encode(payload, jwt_secret, algorithm="HS256")

                    response = jsonify({
                        "message": "Logged in successfully!",
                        "token":token,
                        "Name":user.get("Name"),
                        "Email":email,
                        "Role":role
                    })
                    response.headers["Authorization"] = f"Bearer {token}"
                    
                    response.set_cookie(
                        "Authorization",
                        f"Bearer {token}",
                        httponly=True,
                        secure=True,
                        samesite="Strict",
                    )
                    
                    return response
                else:
                    return make_response(jsonify({"error": "Incorrect password"}), 401)
            else:
                return jsonify({"Message":"This role is not able to access this panel."})
        else:
            return make_response(jsonify({"error": "Email not found"}), 404)

    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


@app.route("/protected", methods=["GET"])
def protected():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Missing token"}), 401
        try:
            decoded_token = jwt.decode(token.split(" ")[1], jwt_secret, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return jsonify({"message": "Access granted", "decoded_token": decoded_token})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



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
    duration = request.headers.get('Duration')
    Username = request.headers.get("Username")
    Useremail = request.headers.get("Useremail")
    
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
                'Name':Username,
                'Email':Useremail,
                'audio_name': real_filename,
                'local_filename': timestamp_filename,
                'upload_time': datetime.now(),
                'transcribed_text': transcribed_text,
                'Duration':duration
            }
            audio_collection.insert_one(audio_data)

            return jsonify({
                'message': 'File uploaded and transcribed successfully',
                'audio_name': real_filename,
                'local_filename': timestamp_filename,
                'transcribed_text': transcribed_text,
            }), 200
        
        except Exception as e:
            return jsonify({'error': f"Error in transcription: {str(e)}"}), 500

    return jsonify({'error': 'Invalid file type'}), 400


@app.route("/update/audio/duration",methods=["GET","POST"])
def update_duration():
    try:
        audio_name = request.headers.get("Filename")
        duration = request.headers.get("Duration")
        
        if not audio_name or not duration:
            return jsonify({'error': 'Audio name and duration are required'}), 400

        result = audio_collection.update_one(
            {"audio_name": audio_name},
            {"$set": {"Duration": duration}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Audio file not found'}), 404

        return jsonify({'message': 'Duration updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': f"Error updating duration: {str(e)}"}), 500
    

@app.route('/audio-list', methods=['GET'])
def list_audio():
    try:
        audios = audio_collection.find()
        audio_list = []
        for audio in audios:
            audio_list.append({
                "Audio_Name" : audio["audio_name"],
                "Transcription_Text":audio["transcribed_text"],
                "Duration":audio["Duration"], 
            })

        if not audio_list:
            return jsonify({'message': 'No audio records found'}), 404

        return jsonify({'audio_files': audio_list}), 200

    except Exception as e:
        return jsonify({'error': f"Error retrieving audio records: {str(e)}"}), 500
    
UPLOAD_FOLDER = 'uploads/audio_files'
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/download_audio_file", methods=["GET"])
def download_file():
    filename = request.headers.get("filename")
    
    audio_name = audio_collection.find_one({"audio_name":f"{filename}"})
    
    if audio_name:
        local_file_name = audio_name.get("local_filename")
        if local_file_name:
            local_file_name = f"{local_file_name}.mp3"
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], local_file_name)
            normalized_filepath = os.path.normpath(filepath)
            if os.path.isfile(normalized_filepath):
                try:
                    return send_file(normalized_filepath, as_attachment=True, download_name=local_file_name)
                except Exception as e:
                    return jsonify({"error": str(e)}), 500
            else:
                return "File is not found."
            
@app.route("/text/download", methods=["GET"])
def download_text(): 
    filename = request.headers.get("filename")
    if filename is None:
        return jsonify({"Error": "There is no filename added in headers"}), 400

    audio_data = audio_collection.find_one({"audio_name": f"{filename}"})
    if not audio_data:
        return jsonify({"Error": "This audio file does not exist."}), 404

    data = audio_data.get("transcribed_text", "")
    if not data:
        return jsonify({"Error": "No transcribed text found for this file."}), 404
    text_file_path = os.path.join("downloads", f"{filename}.txt")
    os.makedirs(os.path.dirname(text_file_path), exist_ok=True)

    with open(text_file_path, "w") as text_file:
        text_file.write(data)

    return send_file(text_file_path, as_attachment=True)
    
@app.route("/create/session", methods=["POST"])
def create_session():
    try:
        data = request.get_json()
        name = data.get("UserName", "Unknown User")
        plan_id = data.get("product_id","None")
        Email = data.get("UserEmail","None")

        date = datetime.now().strftime("%Y-%m-%d")
        description = "Payment of Services of A like and B"

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": plan_id,
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url= url_for("success", _external=True) + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=url_for("cancel", _external=True), 
        )
        payment_table.insert_one({
            "session_id": session.id,
            "Date": date,
            "Email":Email,
            "Name": name,
            "Description": description,
            "amount": 200,
            "currency": "usd",
            "status": "created",
            "Action": "Action"
        })

        return jsonify({"id": session.id, "checkout_url": session.url})

    except Exception as e:
        return jsonify({"Error": str(e)}), 500
    
@app.route("/success")
def success():
    session_id = request.args.get("session_id")
    session = stripe.checkout.Session.retrieve(session_id)
    payment = payment_table.find_one({"session_id":session_id})
    if session.payment_status == "paid":
        payment_table.update_one({"session_id": session_id}, {"$set": {"status": "paid"}})
    return jsonify({"Message":"Payment was successfull."})

@app.route("/cancel")
def cancel():
    return jsonify({"Message":"Payment was cancelled."})
    
@app.route("/payment/list", methods=["GET"])
@role_required(["Admin"])
def payment_list():
    try:
        Payments = payment_table.find()
        PaymentList = []
        for payment in Payments:
            PaymentList.append({
                "Date":payment["Date"],
                "Name" : payment["Name"],
                "Description":payment["Description"],
                "Amount":payment["amount"],
                "Currency":payment["currency"],
                "Status":payment["status"],  
                "Action":payment["Action"]
            })

        return jsonify({"users": PaymentList}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    response = jsonify({"message": "Logged out successfully"})

    response.set_cookie("Authorization", "", expires=0, httponly=True, secure=True, samesite="Strict")

    response.headers["Authorization"] = ""

    return response, 200



@app.route("/add/user",methods=["POST"])
def add_user():
    data = request.get_json()
    Name = data["Name"]
    Email = data["Email"]
    Role = data["Role"]
    if not Name and not Email and not Role:
        return jsonify({"Error":"All paramter are required."})

    random_value = generate_otp()
    password = f"{Name}@,{random_value}"
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    
    mytable.insert_one({
        "Name":Name,
        "Email":Email,
        "Role":Role,
        "Password": hashed_password.decode("utf-8"),
        "Status":"Active"
    })
    Role_table.insert_one({
        "Name":Name,
        "Email":Email,
        "Role":Role,
        "Password": hashed_password.decode("utf-8"),
        "Status":"Active"
    })
    User_list_table.insert_one({
        "Name":Name,
        "Email":Email,
        "Role":Role,
        "Password": hashed_password.decode("utf-8"),
        "Status":"Active"
    })

    if send_otp_email_for_add_user_route(Email):
        return jsonify({"message": f"User created successfully."}), 200
    else:
        return jsonify({"error": "Failed to send OTP."}), 500



from datetime import datetime, timedelta
from flask import request, jsonify
from collections import defaultdict

from datetime import datetime, timedelta
from flask import request, jsonify
from collections import defaultdict

@app.route('/audio_count', methods=['GET'])
def audio_count():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'error': 'Please provide both start_date and end_date'}), 400
        
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
        
        date_diff = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
        
        pipeline = [
            {"$match": {"upload_time": {"$gte": start_date, "$lte": end_date}}},
            {"$group": {"_id": {"Year": {"$year": "$upload_time"}, "Month": {"$month": "$upload_time"}},
                         "total_audio": {"$sum": 1}}},
            {"$sort": {"_id.Year": 1, "_id.Month": 1}}
        ]
        
        grouped_data = list(audio_collection.aggregate(pipeline))
        
        result = []
        data_dict = defaultdict(int)
        
        if date_diff < 12:
            current_date = start_date
            while current_date <= end_date:
                period = f"{current_date.year},{current_date.strftime('%b')}"
                data_dict[period] = 0
                current_date += timedelta(days=32)
                current_date = current_date.replace(day=1)

            for record in grouped_data:
                period = f"{record['_id']['Year']},{datetime(record['_id']['Year'], record['_id']['Month'], 1).strftime('%b')}"
                data_dict[period] = record["total_audio"]
        else:
            pipeline = [
                {"$match": {"upload_time": {"$gte": start_date, "$lte": end_date}}},
                {"$group": {"_id": {"Year": {"$year": "$upload_time"}},
                             "total_audio": {"$sum": 1}}},
                {"$sort": {"_id.Year": 1}}
            ]
            
            grouped_data = list(audio_collection.aggregate(pipeline))
            
            for year in range(start_date.year, end_date.year + 1):
                data_dict[str(year)] = 0
            
            for record in grouped_data:
                year = str(record['_id']['Year'])
                data_dict[year] = record["total_audio"]
        
        for period, total_audio in sorted(data_dict.items()):
            result.append({"Period": period, "Total_Audio": total_audio})
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': f"Error fetching audio count: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)