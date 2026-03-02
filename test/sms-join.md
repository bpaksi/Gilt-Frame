TWILIO_SKIP_SIGNATURE_VALIDATION=true

# Someone texts HELP

curl -X POST http://localhost:3501/api/webhooks/twilio/inbound \
 -H "Content-Type: application/x-www-form-urlencoded" \
 -H "x-twilio-signature: skip" \
 -d "From=%2B15551234567&To=%2B1YOURTWILIONUMBER&Body=HELP&MessageSid=SM_test_001"

# Someone texts STOP

curl -X POST http://localhost:3501/api/webhooks/twilio/inbound \
 -H "Content-Type: application/x-www-form-urlencoded" \
 -H "x-twilio-signature: skip" \
 -d "From=%2B15551234567&To=%2B1YOURTWILIONUMBER&Body=STOP&MessageSid=SM_test_002"

# Someone texts START (resubscribe)

curl -X POST http://localhost:3501/api/webhooks/twilio/inbound \
 -H "Content-Type: application/x-www-form-urlencoded" \
 -H "x-twilio-signature: skip" \
 -d "From=%2B15551234567&To=%2B1YOURTWILIONUMBER&Body=START&MessageSid=SM_test_003"
