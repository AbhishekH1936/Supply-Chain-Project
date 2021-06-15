# Install Visual Studio
# Install Ganache
# Add metamask Wallet
# Install React-Js and required libraries(specified in package.json file).

# Import accounts from ganache to metamask
Here we copy the private key and import the required no of accounts and connect the required account.

# open Visual Studio.
Open commandline ,
Use Truffle compile- to compile the contracts.
Use Truffle migrate - to migrate the contracts.
Now do npm start- to run the app.

# Running Application
Read the insteuctions.
## Signup
All actors should signup by providing the required  generalized credentials.
1) Firstname
2) Lastname
3) Address
4) email
5) password
6) Document(PDF only)
7) Public key
8) Contact no
## Additional Details  for few actors:
Agro-Consultant
  1) Specialization
  2) qualification 
  3) College name
  
Transporter
  1) Price per kg
  2) Price per km

# Approval of actors from Governing Authority
Governing authority will login and checks all credentials and verifies the documents.

# For all the below mentioned actors,the metamask notification will pop-up to confirm the transaction.

# Farmer
# Investor:
 Investor Displays funding status of crops i.e. Funding Activated or Waiting for Funding.
 ## Activate Funding:
For all the crops whose investment has not reached maximum amount over crop duration, investor activates the funding by making investment of his choice. Transfer of ethers take place from investor to farmer
## Returns back to Investor: 
Investor will get back money, in which he might gain profit or incur loss depending on the  selling price. 

# Transporter:
Transporter transports the goods to the concerned retailer based on his requirements.Retailer makes a request to distributor to supply goods to his location.Distributor takes all required information from the retailer like the crop he want to buy,the type of storage he needs ,the distance of his location and the quantity of crops he needs(in kg).These requirements are validated by distributor and he sends the transportation request to the list of transporters available.
## Accept or Reject Request:
The Transporter accepts the request the  moment the required amount is transferred  to  his  account.The transporter  may  reject the request if the amount has not been transferred to his account or if he is unavailable for transporting goods in that particular location.



  

  









