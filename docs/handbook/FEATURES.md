# Milestone

## 📘 Introduction: Purpose of this Document

This document was created for the following purposes:

- To accurately communicate the current implementation status and policy to existing stakeholders and serve as a basis for discussions regarding implementation.
- To provide an explanation for those who wish to utilize the digital infrastructure we are developing as open source.

---

## 🌐 Web3 Design Policy (as of April 2025)

1. **Identification (DID - Decentralized Identifier)**
- A decentralized identifier, a self-sovereign ID that users can generate and manage themselves.
- Standardized by the W3C, the DID Document describes public keys, service endpoints, etc.
- In this system, a DID is automatically generated after logging in via Firebase Auth.

2. **Verifiable Credential (VC - Verifiable Credential)**
- A verifiable credential signed by the issuer, standardized by the W3C.
- Users can hold VC within their own DID Wallet and present it as needed.

3. **Assets (Tokens / NFTs)**
- Currently supported through off-chain implementation.
- Issuing NFTs as tickets or membership cards is under consideration.
- Unlike DID Wallet, the primary purpose is to visualize and transfer assets managed by users.

4. **Custodial Wallet**
- Users' private keys and VC are managed by the system.
- Users can use the service without having to worry about wallet operations or private key management.
- "Usage" is prioritized, as "records of local experiences" are issued as VC.

---

## 🧩 List of Implemented Features (as of April 2025)
The main features currently provided are organized by purpose and category.

### 🧑‍🤝‍🧑 Account
**Responsible for managing the system's operations**

#### 👤 User (User)
- Register
- Edit Profile
- Delete Account

#### 🏘️ Community (Organization)
- Create a Community
- Edit Profile
- Delete a Community

#### 🪪 Membership (Membership)
- Join a Community
- Invite to a Community
- Leave a Community
- Change Member Permissions
- Force Members to Leave

### 🧪 Experience (Experience)
**Responsible for recruiting and applying for opportunities, as well as post-activity evaluations**

#### 📣 Opportunity (Recruitment)
- Register a recruitment
- Edit a recruitment
- Make a recruitment public/private
- Delete a recruitment

#### 🗓️ OpportunitySlot (Event Date and Time)
- Edit the recruitment event date and time
- Change the event schedule

#### 📩 Reservation
- Request a reservation
- Approve a reservation
- Deny a reservation
- Cancel a reservation
- Join a companion's reservation

#### 🧾 Participation
- Request a past activity
- Delete a requested activity

#### ✅ Evaluation
- Evaluate an activity

### 📝 Content
**Promotes reservations to opportunities**

#### 📰 Article
- Create an article
- Edit an article
- Publish/Unpublish an article
- Delete an article

### 🎁 Reward
**Reward for participation**

#### 🙋 Utility
- Register a utility
- Edit a utility
- Publish/Unpublish a utility
- Delete a utility

#### 🎟️ Ticket
- ​​Buy a ticket
- Giving/Receiving Tickets
- Refunding Tickets
- Using Tickets

### 💰 Points
**Issuing community funds and actively circulating points**

- Issuing community points
- Contributing points from the community
- Giving (your own) points

---

## 🚀 Quick Domain Implementation Guide

### 1️⃣ Three Questions to Determine Minimum Functionality

1. **Asset**: Are tangible assets (including chin and foot pillows) such as accommodation, meals, and goods available?

2. **Community**: Are pricing changes acceptable?

3. **Point**: Is operation impossible without a "common balance" across multiple venues?
- The same participants move between multiple events or organizations.
- I want to donate or subsidize my remaining points to other organizations.
- I want to recognize and vote based on cumulative contributions across multiple events.

Answering **Yes/No** in this order will apply to one of the following scenarios.
The **Introduction Domain Set** written there is your MVP.

### Scenario and Introduction Domain

```
Asset: Are tangible assets (including chin and foot pillows) such as accommodation, meals, and items available?
├─ ⭕️
│ Community: Are pricing changes acceptable?
│ ├─ ⭕️
│ │ Point: Is operation impossible without a "common balance" across multiple venues?
│ │ ├─ ⭕️ → ① Account + Points
│ │ │ └ Straight to Tokenomics: Sufficient assets and trust, points can be circulated immediately (e.g., Kibotcha)
│ │ └─ ✖️ → ② Account + Experience + Location + Content + Rewards
│ │ └ Utilizing Tangible Assets: Abundant assets, tickets and experiences are enough to keep things running (e.g., ASOBO, Prince's Forest of Play and Adventure)
│ └─ ✖️
│ Point: Is operation impossible without a "common balance" across multiple venues?
│ ├─ ⭕️ → ③Account + Experience + Points
│ │ └ Token Beta: Admins are enthusiastic about points but lack trust; small-scale beta operation (even if implemented, it will likely malfunction)
│ └─ ✖️ → ④Account + Experience + Location + Content + Reward
│ └ Experience-driven: Complicated interests; first build trust through experiences and tickets (e.g., NEO88)
└─ ✖️
Community: Are relationships in place that allow pricing changes to be accepted?
├─ ⭕️
│ Point: Is the operation in a state where it would be impossible to function without a "common balance" across multiple venues?
│ ├─ ⭕️ → ⑤Account + Point
│ │ └ Digital Experiment: Online DAO is a point even with almost no assets/NFT experiment (e.g., Aruke)
│ └─ ✖️ → ⑥Account + Experience + Content
│ └ Emphasis on digital experience: Maintain with lightweight content such as articles (introduce useful content first)
└─ ✖️ → ⑦Account + Experience + Content (For those who want to start something locally 🥰)
└ Minimum Startup: Build assets with friends through Quest
```

### 3️⃣ How to Use (30 seconds)

1. Answer **Yes/No** to the three questions
2. Find the appropriate row in the table above
3. **First implement** the domain set listed
4. As trust and assets increase, step up to the scenarios “up” or “to the left” of the table