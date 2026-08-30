# Database

MongoDB/Mongoose models currently cover User, Property, PropertyDocument, Verification, Inspection, Offer, Transaction, Conversation, Message, LawyerProfile, InspectorProfile, Notification, Payment, and Review.

Users can have multiple roles. Properties reference their seller user, and offers reference buyer and seller users. Large files are represented by URLs and metadata rather than stored in MongoDB. Schema detail should grow with validated product behavior.
