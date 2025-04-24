#!/bin/bash

# Make sure the server is running on localhost:3000

# Paths to your files
# ORDER_FILE="test/OrderStructure.txt"
# CONFIG_FILE="test/config.json"
# RELATED_CODE_FILE="repomix-output.txt"

# # Business requirement
# #BUSINESS_REQ="Add a method to calculate total order price including tax in the Order class."
# BUSINESS_REQ="bookshop_logic.txt"

#bookshop logic.txt
# Run curl request


# curl -X POST http://localhost:3000/generate \
#   -F "files=@$ORDER_FILE" \
#   -F "files=@$CONFIG_FILE" \
#   -F "businessRequirement=$BUSINESS_REQ" \
#   -F "relatedCode=<${RELATED_CODE_FILE}"| jq

BUSINESS_REQUIREMENT=$(jq -Rs . < bookshop_logic.txt)
RELATED_CODE=$(jq -Rs . < repomix-output.txt)

# Print the raw payload for debugging
# echo "📦 Payload:"
# echo '{
#   "businessRequirement": '"$BUSINESS_REQUIREMENT"'
# }'

# Send the request
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "businessRequirement": '"$BUSINESS_REQUIREMENT"',
    "relatedCode": '"$RELATED_CODE"'
  }'


