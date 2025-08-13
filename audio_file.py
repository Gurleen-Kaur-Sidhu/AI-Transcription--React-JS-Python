from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import pymongo
from datetime import datetime
import assemblyai as aai

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads/audio_files'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'flac', 'ogg', 'aac'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["User"]
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

if __name__ == '__main__':
    app.run(debug=True)
