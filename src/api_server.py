

# from twilio.rest import Client
# from flask import Flask, request, Response
# from twilio.twiml.voice_response import VoiceResponse, Gather
# from pymongo import MongoClient
# from datetime import datetime, timedelta
# import threading
# import time
# from bson.objectid import ObjectId # CRITICAL: Import ObjectId for Mongoose ID compatibility
# import uuid

# # --- CONFIGURATION ---
# # Replace this with your actual connection string
# MONGODB_URI = "mongodb+srv://rajsimhamv:cornoforge@sehath-cluster.a7enrfy.mongodb.net/?retryWrites=true&w=majority" 

# # Twilio Credentials
# TWILIO_ACCOUNT_SID = "AC66b8b0b6a46a3a378a54e4c79e3c43d2"
# TWILIO_AUTH_TOKEN = "07df97728091763a504e272439520e33"
# TWILIO_NUMBER = "+12707431760"       # Twilio number
# # !!! IMPORTANT: Update this NGROK_URL every time you restart ngrok !!!
# NGROK_URL = "https://tom-bullous-nonseraphically.ngrok-free.dev" # REPLACE WITH YOUR CURRENT NGROK URL

# twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# # ------------------ MONGODB SETUP (CORRECTED) ------------------
# mongo_client = MongoClient(MONGODB_URI)
# # CRITICAL FIX: Explicitly specify the database name is 'test'
# db = mongo_client.get_database("test") 

# # Reference the collections used by both the Python scheduler AND the Node.js app
# python_schedules_collection = db.schedules   # The custom collection created by Node.js for Python
# medicines_collection = db.medicines          # The collection that holds the stock (Node.js Medicine model)

# # ------------------ FLASK APP ------------------
# app = Flask(__name__)

# # ------------------ TWILIO VOICE ENDPOINT ------------------
# @app.route("/voice", methods=['GET', 'POST'])
# def voice():
#     schedule_id = request.args.get('schedule_id')
#     tablet_name = request.args.get('tablet_name', 'your tablet')

#     resp = VoiceResponse()
#     gather = Gather(
#         input='speech dtmf',
#         num_digits=1,
#         timeout=5,
#         action=f'{NGROK_URL}/gather?schedule_id={schedule_id}' 
#     )
#     gather.say(
#         f"Hello! Did you take your {tablet_name} today? Please say yes or no, or press 1 for yes, 2 for no.",
#         voice='alice'
#     )
#     resp.append(gather)
#     resp.say("We did not receive your response. Goodbye!")
#     return Response(str(resp), mimetype='text/xml')

# # ------------------ GATHER RESPONSE ------------------
# @app.route("/gather", methods=['GET', 'POST'])
# def gather():
#     schedule_id = request.args.get('schedule_id')
#     resp = VoiceResponse()
#     speech_result = request.values.get('SpeechResult', '').lower()
#     dtmf = request.values.get('Digits', '')

#     schedule = python_schedules_collection.find_one({"_id": schedule_id})
#     if not schedule:
#         resp.say("Schedule not found. Goodbye!", voice='alice')
#         resp.hangup()
#         return Response(str(resp), mimetype='text/xml')

#     tablet_name = schedule['tablet_name']
    
#     print("Speech result:", speech_result)
#     print("DTMF input:", dtmf)

#     if 'yes' in speech_result or dtmf == '1':
#         # --- STOCK DECREMENT LOGIC ---
#         medicine_id_str = schedule.get('medicine_id')
        
#         if medicine_id_str:
#             try:
#                 # Convert string ID from Node.js to MongoDB's ObjectId
#                 medicine_id = ObjectId(medicine_id_str)
                
#                 # Decrement the stock by 1
#                 update_result = medicines_collection.update_one(
#                     {"_id": medicine_id},
#                     {"$inc": {"stock": -1}}  
#                 )
                
#                 if update_result.modified_count > 0:
#                     print(f"Stock reduced by 1 for medicine ID: {medicine_id_str}")
#                     resp.say(f"Great! Thank you for taking your {tablet_name}.", voice='alice')
#                 else:
#                     print(f"Could not reduce stock. Medicine ID: {medicine_id_str} not found or stock already 0.")
#                     resp.say(f"Thank you for confirming! Your stock may need review.", voice='alice')
#             except Exception as e:
#                 print(f"Error updating stock (ID conversion or DB error): {e}")
#                 resp.say(f"Thank you for confirming! An error occurred while updating the stock.", voice='alice')
#         else:
#             resp.say(f"Thank you for taking your {tablet_name}. Medicine ID missing for stock update.", voice='alice')
            
#     elif 'no' in speech_result or dtmf == '2':
#         resp.say(f"Please take your {tablet_name} now. We will call you again in 5 minutes to reconfirm.", voice='alice')
#         threading.Timer(5*60, lambda: make_call(schedule_id)).start()
#     else:
#         resp.say(f"Could not understand your response. Asking again.", voice='alice')
#         threading.Timer(10, lambda: make_call(schedule_id)).start()

#     resp.hangup()
#     return Response(str(resp), mimetype='text/xml')


# # ------------------ CALL STATUS CALLBACK ------------------
# @app.route("/status", methods=['POST'])
# def call_status():
#     call_status = request.values.get('CallStatus', '')
#     schedule_id = request.args.get('schedule_id')
#     print("Call ended with status:", call_status)

#     schedule = python_schedules_collection.find_one({"_id": schedule_id})
#     if not schedule:
#         return ('', 204)

#     busy_attempts = schedule.get('busy_attempts', 0)

#     if call_status == 'busy':
#         busy_attempts += 1
#         python_schedules_collection.update_one(
#             {"_id": schedule_id},
#             {"$set": {"busy_attempts": busy_attempts}}
#         )
#         print(f"Busy attempt #{busy_attempts} for schedule {schedule_id}")

#         if busy_attempts < 3:
#             print("Retrying call in 1 minute...")
#             threading.Timer(60, lambda: make_call(schedule_id)).start()
#         else:
#             print("3 busy attempts reached. Sending alert to caretaker.")
#             send_alert_to_caretaker(schedule['caretaker_number'])

#     elif call_status in ['no-answer', 'failed']:
#         missed_attempts = schedule.get('missed_attempts', 0) + 1
#         python_schedules_collection.update_one({"_id": schedule_id}, {"$set": {"missed_attempts": missed_attempts}})
#         print(f"Missed attempt #{missed_attempts} for schedule {schedule_id}")

#         if missed_attempts >= 3:
#             send_alert_to_caretaker(schedule['caretaker_number'])

#     return ('', 204)


# # ------------------ SEND ALERT ------------------
# def send_alert_to_caretaker(caretaker_number):
#     message = twilio_client.messages.create(
#         body="⚠️ Patient did not respond to the medicine reminder after 3 calls!",
#         from_=TWILIO_NUMBER,
#         to=caretaker_number
#     )
#     print("Alert SMS sent. SID:", message.sid)

# # ------------------ MAKE CALL ------------------
# def make_call(schedule_id):
#     schedule = python_schedules_collection.find_one({"_id": schedule_id})
#     if not schedule:
#         print(f"No schedule found for ID {schedule_id}")
#         return

#     patient_number = schedule['patient_number']
#     tablet_name = schedule['tablet_name']

#     call = twilio_client.calls.create(
#         url=f"{NGROK_URL}/voice?schedule_id={schedule_id}&tablet_name={tablet_name}",
#         from_=TWILIO_NUMBER,
#         to=patient_number,
#         status_callback=f"{NGROK_URL}/status?schedule_id={schedule_id}",
#         status_callback_event=['completed', 'no-answer', 'busy', 'failed']
#     )
#     print("Call initiated. SID:", call.sid)

# # ------------------ SCHEDULER THREAD ------------------
# def schedule_checker():
#     while True:
#         now = datetime.now()
#         # Find schedules that are due and haven't been called (status: 0)
#         pending_schedules = python_schedules_collection.find({
#             "time": {"$lte": now},
#             "status": 0
#         })
#         for schedule in pending_schedules:
#             schedule_id = schedule['_id']
#             print(f"Triggering call for schedule ID: {schedule_id}")
#             make_call(schedule_id)
#             # Set status to 1 (called) so it's not called again in the next loop
#             python_schedules_collection.update_one({"_id": schedule_id}, {"$set": {"status": 1}})
#         time.sleep(10)

# # ------------------ RUN ------------------
# if __name__ == "__main__":
#     threading.Thread(target=schedule_checker, daemon=True).start()
#     print("Starting Flask server on http://localhost:5000")
#     app.run(host='0.0.0.0', port=5000)

# fileName: api_server.py

# Install dependencies if not already:
# pip install twilio flask pymongo python-dotenv bson

from twilio.rest import Client
from flask import Flask, request, Response
from twilio.twiml.voice_response import VoiceResponse, Gather
from pymongo import MongoClient
from datetime import datetime, timedelta
import threading
import time
from bson.objectid import ObjectId # CRITICAL: Import ObjectId for Mongoose ID compatibility
import uuid

# --- CONFIGURATION ---
# Replace this with your actual connection string
MONGODB_URI = "mongodb+srv://rajsimhamv:cornoforge@sehath-cluster.a7enrfy.mongodb.net/?retryWrites=true&w=majority" 

# Twilio Credentials
TWILIO_ACCOUNT_SID = "AC66b8b0b6a46a3a378a54e4c79e3c43d2"
TWILIO_AUTH_TOKEN = "07df97728091763a504e272439520e33"
TWILIO_NUMBER = "+12707431760"       # Twilio number
# !!! IMPORTANT: Update this NGROK_URL every time you restart ngrok !!!
NGROK_URL = "https://tom-bullous-nonseraphically.ngrok-free.dev" # REPLACE WITH YOUR CURRENT NGROK URL

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# ------------------ MONGODB SETUP ------------------
mongo_client = MongoClient(MONGODB_URI)
# CRITICAL FIX: Explicitly specify the database name is 'test'
db = mongo_client.get_database("test") 

# Reference the collections used by both the Python scheduler AND the Node.js app
python_schedules_collection = db.schedules   # The custom collection created by Node.js for Python
medicines_collection = db.medicines          # The collection that holds the stock (Node.js Medicine model)

# ------------------ FLASK APP ------------------
app = Flask(__name__)

# ------------------ TWILIO VOICE ENDPOINT ------------------
@app.route("/voice", methods=['GET', 'POST'])
def voice():
    schedule_id = request.args.get('schedule_id')
    tablet_name = request.args.get('tablet_name', 'your tablet')

    resp = VoiceResponse()
    gather = Gather(
        input='speech dtmf',
        num_digits=1,
        timeout=5,
        action=f'{NGROK_URL}/gather?schedule_id={schedule_id}' 
    )
    gather.say(
        f"Hello! Did you take your {tablet_name} today? Please say yes or no, or press 1 for yes, 2 for no.",
        voice='alice'
    )
    resp.append(gather)
    resp.say("We did not receive your response. Goodbye!")
    return Response(str(resp), mimetype='text/xml')

# ------------------ GATHER RESPONSE ------------------
@app.route("/gather", methods=['GET', 'POST'])
def gather():
    schedule_id = request.args.get('schedule_id')
    resp = VoiceResponse()
    speech_result = request.values.get('SpeechResult', '').lower()
    dtmf = request.values.get('Digits', '')

    schedule = python_schedules_collection.find_one({"_id": schedule_id})
    if not schedule:
        resp.say("Schedule not found. Goodbye!", voice='alice')
        resp.hangup()
        return Response(str(resp), mimetype='text/xml')

    tablet_name = schedule.get('tablet_name')
    
    print("Speech result:", speech_result)
    print("DTMF input:", dtmf)

    if 'yes' in speech_result or dtmf == '1':
        # --- STOCK DECREMENT LOGIC ---
        medicine_id_str = schedule.get('medicine_id')
        
        if medicine_id_str:
            try:
                # Convert string ID from Node.js to MongoDB's ObjectId
                medicine_id = ObjectId(medicine_id_str)
                
                # Decrement the stock by 1
                update_result = medicines_collection.update_one(
                    {"_id": medicine_id},
                    {"$inc": {"stock": -1}}  
                )
                
                if update_result.modified_count > 0:
                    print(f"Stock reduced by 1 for medicine ID: {medicine_id_str}")
                    resp.say(f"Great! Thank you for taking your {tablet_name}.", voice='alice')
                else:
                    print(f"Could not reduce stock. Medicine ID: {medicine_id_str} not found or stock already 0.")
                    resp.say(f"Thank you for confirming! Your stock may need review.", voice='alice')
            except Exception as e:
                print(f"Error updating stock (ID conversion or DB error): {e}")
                resp.say(f"Thank you for confirming! An error occurred while updating the stock.", voice='alice')
        else:
            resp.say(f"Thank you for taking your {tablet_name}. Medicine ID missing for stock update.", voice='alice')
            
    elif 'no' in speech_result or dtmf == '2':
        resp.say(f"Please take your {tablet_name} now. We will call you again in 5 minutes to reconfirm.", voice='alice')
        threading.Timer(5*60, lambda: make_call(schedule_id)).start()
    else:
        resp.say(f"Could not understand your response. Asking again.", voice='alice')
        threading.Timer(10, lambda: make_call(schedule_id)).start()

    resp.hangup()
    return Response(str(resp), mimetype='text/xml')


# ------------------ CALL STATUS CALLBACK ------------------
@app.route("/status", methods=['POST'])
def call_status():
    call_status = request.values.get('CallStatus', '')
    schedule_id = request.args.get('schedule_id')
    print("Call ended with status:", call_status)

    schedule = python_schedules_collection.find_one({"_id": schedule_id})
    if not schedule:
        return ('', 204)

    busy_attempts = schedule.get('busy_attempts', 0)

    if call_status == 'busy':
        busy_attempts += 1
        python_schedules_collection.update_one(
            {"_id": schedule_id},
            {"$set": {"busy_attempts": busy_attempts}}
        )
        print(f"Busy attempt #{busy_attempts} for schedule {schedule_id}")

        if busy_attempts < 3:
            print("Retrying call in 1 minute...")
            threading.Timer(60, lambda: make_call(schedule_id)).start()
        else:
            print("3 busy attempts reached. Sending alert to caretaker.")
            send_alert_to_caretaker(schedule.get('caretaker_number'))

    elif call_status in ['no-answer', 'failed']:
        missed_attempts = schedule.get('missed_attempts', 0) + 1
        python_schedules_collection.update_one({"_id": schedule_id}, {"$set": {"missed_attempts": missed_attempts}})
        print(f"Missed attempt #{missed_attempts} for schedule {schedule_id}")

        if missed_attempts >= 3:
            send_alert_to_caretaker(schedule.get('caretaker_number'))

    return ('', 204)


# ------------------ SEND ALERT ------------------
def send_alert_to_caretaker(caretaker_number):
    if not caretaker_number:
        print("ERROR: Caretaker number missing. Cannot send alert.")
        return
        
    message = twilio_client.messages.create(
        body="⚠️ Patient did not respond to the medicine reminder after 3 calls!",
        from_=TWILIO_NUMBER,
        to=caretaker_number
    )
    print("Alert SMS sent. SID:", message.sid)

# ------------------ MAKE CALL (UPDATED with Null Check) ------------------
def make_call(schedule_id):
    schedule = python_schedules_collection.find_one({"_id": schedule_id})
    
    # CRITICAL FIX 1: Check if the document was found (prevents crash on simultaneous delete/phantom ID)
    if schedule is None:
        print(f"ERROR: Schedule ID {schedule_id} is missing from the DB. Skipping call.")
        return

    # Use .get() for safer dictionary access
    patient_number = schedule.get('patient_number')
    tablet_name = schedule.get('tablet_name')
    
    # CRITICAL FIX 2: If patient_number is missing or None, exit immediately (Twilio Error 21201 fix)
    if not patient_number:
         print(f"ERROR: Patient number missing for schedule ID {schedule_id}. Cannot place call.")
         return

    call = twilio_client.calls.create(
        url=f"{NGROK_URL}/voice?schedule_id={schedule_id}&tablet_name={tablet_name}",
        from_=TWILIO_NUMBER,
        to=patient_number,
        status_callback=f"{NGROK_URL}/status?schedule_id={schedule_id}",
        status_callback_event=['completed', 'no-answer', 'busy', 'failed']
    )
    print("Call initiated. SID:", call.sid)

# ------------------ SCHEDULER THREAD ------------------
def schedule_checker():
    while True:
        now = datetime.now()
        
        # Query: Find schedules that are DUE (time <= now) and haven't been called (status: 0)
        pending_schedules = python_schedules_collection.find({
            "time": {"$lte": now},
            "status": 0
        })
        for schedule in pending_schedules:
            schedule_id = schedule['_id']
            print(f"Triggering call for schedule ID: {schedule_id}")
            
            # Initiate the call
            make_call(schedule_id)
            
            # Mark the schedule as called (status: 1) immediately to prevent it from 
            # being processed in the next 10-second loop.
            # We use update_one with upsert=False for safety.
            python_schedules_collection.update_one(
                {"_id": schedule_id}, 
                {"$set": {"status": 1}},
                upsert=False 
            )
            
        time.sleep(10)

# ------------------ RUN ------------------
if __name__ == "__main__":
    threading.Thread(target=schedule_checker, daemon=True).start()
    print("Starting Flask server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000)