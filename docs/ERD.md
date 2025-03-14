```mermaid
erDiagram

        ArticleCategory {
            ACTIVITY_REPORT ACTIVITY_REPORT
INTERVIEW INTERVIEW
        }
    


        PublishStatus {
            PUBLIC PUBLIC
COMMUNITY_INTERNAL COMMUNITY_INTERNAL
PRIVATE PRIVATE
        }
    


        Role {
            OWNER OWNER
MANAGER MANAGER
MEMBER MEMBER
        }
    


        MembershipStatus {
            PENDING PENDING
JOINED JOINED
LEFT LEFT
        }
    


        MembershipStatusReason {
            CREATED_COMMUNITY CREATED_COMMUNITY
INVITED INVITED
CANCELED_INVITATION CANCELED_INVITATION
ACCEPTED_INVITATION ACCEPTED_INVITATION
DECLINED_INVITATION DECLINED_INVITATION
WITHDRAWN WITHDRAWN
REMOVED REMOVED
ASSIGNED ASSIGNED
        }
    


        WalletType {
            COMMUNITY COMMUNITY
MEMBER MEMBER
        }
    


        OpportunityCategory {
            QUEST QUEST
EVENT EVENT
ACTIVITY ACTIVITY
        }
    


        ParticipationStatus {
            PENDING PENDING
PARTICIPATING PARTICIPATING
PARTICIPATED PARTICIPATED
NOT_PARTICIPATING NOT_PARTICIPATING
        }
    


        ParticipationStatusReason {
            INVITED INVITED
CANCELED_INVITATION CANCELED_INVITATION
ACCEPTED_INVITATION ACCEPTED_INVITATION
DECLINED_INVITATION DECLINED_INVITATION
APPLIED APPLIED
WITHDRAW_APPLICATION WITHDRAW_APPLICATION
ACCEPTED_APPLICATION ACCEPTED_APPLICATION
DECLINED_APPLICATION DECLINED_APPLICATION
QUALIFIED_PARTICIPATION QUALIFIED_PARTICIPATION
UNQUALIFIED_PARTICIPATION UNQUALIFIED_PARTICIPATION
        }
    


        TicketStatus {
            AVAILABLE AVAILABLE
DISABLED DISABLED
        }
    


        TicketStatusReason {
            PURCHASED PURCHASED
CANCELED CANCELED
RESERVED RESERVED
USED USED
REFUNDED REFUNDED
EXPIRED EXPIRED
        }
    


        TransactionReason {
            POINT_ISSUED POINT_ISSUED
POINT_REWARD POINT_REWARD
DONATION DONATION
GRANT GRANT
TICKET_PURCHASED TICKET_PURCHASED
TICKET_REFUNDED TICKET_REFUNDED
        }
    


        IdentityPlatform {
            LINE LINE
FACEBOOK FACEBOOK
        }
    


        SysRole {
            SYS_ADMIN SYS_ADMIN
USER USER
        }
    
  "t_articles" {
    String id "🗝️"
    String title 
    String introduction 
    ArticleCategory category 
    PublishStatus publish_status 
    String body 
    Json thumbnail "❓"
    DateTime published_at 
    String community_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_communities" {
    String id "🗝️"
    String name 
    String point_name 
    String image "❓"
    String bio "❓"
    DateTime established_at "❓"
    String website "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "m_cities" {
    String code "🗝️"
    String name 
    String state_code 
    String country_code 
    }
  

  "m_states" {
    String code "🗝️"
    String name 
    String country_code 
    }
  

  "t_memberships" {
    String user_id 
    String community_id 
    MembershipStatus status 
    MembershipStatusReason reason 
    Role role 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_membership_histories" {
    String id "🗝️"
    Role role 
    MembershipStatus status 
    MembershipStatusReason reason 
    String userId 
    String communityId 
    String created_by "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_wallets" {
    String wallet_id "🗝️"
    WalletType type 
    String community_id 
    String user_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_opportunities" {
    String id "🗝️"
    String title 
    String description 
    String body "❓"
    OpportunityCategory category 
    PublishStatus publish_status 
    Boolean require_approval 
    Int capacity "❓"
    Int points_to_earn "❓"
    Int fee_required "❓"
    String image "❓"
    Json files 
    DateTime starts_at "❓"
    DateTime ends_at "❓"
    String place_id "❓"
    String community_id 
    String created_by 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_opportunity_invitations" {
    String is_valid "🗝️"
    String code 
    Boolean is_valid 
    String opportunity_id 
    String created_by 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_opportunity_invitation_histories" {
    String id "🗝️"
    String invitation_id 
    String invited_user_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_opportunity_slots" {
    String id "🗝️"
    DateTime starts_at 
    DateTime ends_at 
    String opportunity_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_participations" {
    String id "🗝️"
    ParticipationStatus status 
    ParticipationStatusReason reason 
    Json images "❓"
    String user_id "❓"
    String community_id "❓"
    String opportunity_id "❓"
    String opportunity_slot_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_participation_status_histories" {
    String id "🗝️"
    ParticipationStatus status 
    ParticipationStatusReason reason 
    String participation_id 
    String created_by "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_places" {
    String id "🗝️"
    String name 
    String address 
    Decimal latitude 
    Decimal longitude 
    Boolean is_manual 
    String google_place_id "❓"
    Json map_location "❓"
    String city_code 
    String communityId 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_tickets" {
    String id "🗝️"
    TicketStatus status 
    TicketStatusReason reason 
    String wallet_id 
    String utility_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_ticket_status_histories" {
    String id "🗝️"
    TicketStatus status 
    TicketStatusReason reason 
    String ticket_id 
    String created_by "❓"
    String transaction_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_transactions" {
    String id "🗝️"
    TransactionReason reason 
    String from "❓"
    Int from_point_change 
    String to "❓"
    Int to_point_change 
    String participation_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_identities" {
    String uid "🗝️"
    IdentityPlatform platform 
    String user_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_users" {
    String id "🗝️"
    String name 
    String slug 
    String image "❓"
    String bio "❓"
    SysRole sys_role 
    String url_website "❓"
    String url_x "❓"
    String url_facebook "❓"
    String url_instagram "❓"
    String url_youtube "❓"
    String url_tiktok "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_utilities" {
    String id "🗝️"
    String name 
    String description "❓"
    String image "❓"
    Int points_required 
    PublishStatus publish_status 
    String community_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "mv_current_points" {
    String walletId "🗝️"
    Int currentPoint 
    }
  

  "mv_accumulated_points" {
    String walletId "🗝️"
    Int accumulatedPoint 
    }
  
    "t_articles" o|--|| "ArticleCategory" : "enum:category"
    "t_articles" o|--|| "PublishStatus" : "enum:publish_status"
    "t_articles" o|--|| "t_communities" : "community"
    "t_articles" o{--}o "t_users" : "authors"
    "t_articles" o{--}o "t_users" : "relatedUsers"
    "t_articles" o{--}o "t_opportunities" : "opportunities"
    "t_communities" o{--}o "t_places" : "places"
    "t_communities" o{--}o "t_memberships" : "memberships"
    "t_communities" o{--}o "t_wallets" : "wallets"
    "t_communities" o{--}o "t_utilities" : "utilities"
    "t_communities" o{--}o "t_opportunities" : "opportunities"
    "t_communities" o{--}o "t_participations" : "participations"
    "t_communities" o{--}o "t_articles" : "articles"
    "m_cities" o|--|| "m_states" : "state"
    "m_cities" o{--}o "t_places" : "places"
    "m_states" o{--}o "m_cities" : "cities"
    "t_memberships" o|--|| "t_users" : "user"
    "t_memberships" o|--|| "t_communities" : "community"
    "t_memberships" o|--|| "MembershipStatus" : "enum:status"
    "t_memberships" o|--|| "MembershipStatusReason" : "enum:reason"
    "t_memberships" o|--|| "Role" : "enum:role"
    "t_memberships" o{--}o "t_membership_histories" : "histories"
    "t_membership_histories" o|--|| "Role" : "enum:role"
    "t_membership_histories" o|--|| "MembershipStatus" : "enum:status"
    "t_membership_histories" o|--|| "MembershipStatusReason" : "enum:reason"
    "t_membership_histories" o|--|| "t_memberships" : "membership"
    "t_membership_histories" o|--|o "t_users" : "createdByUser"
    "t_wallets" o|--|| "WalletType" : "enum:type"
    "t_wallets" o|--|| "t_communities" : "community"
    "t_wallets" o|--|o "t_users" : "user"
    "t_wallets" o{--}o "mv_current_points" : "currentPointView"
    "t_wallets" o{--}o "mv_accumulated_points" : "accumulatedPointView"
    "t_wallets" o{--}o "t_transactions" : "fromTransactions"
    "t_wallets" o{--}o "t_transactions" : "toTransactions"
    "t_wallets" o{--}o "t_tickets" : "tickets"
    "t_opportunities" o|--|| "OpportunityCategory" : "enum:category"
    "t_opportunities" o|--|| "PublishStatus" : "enum:publish_status"
    "t_opportunities" o|--|o "t_places" : "place"
    "t_opportunities" o|--|| "t_communities" : "community"
    "t_opportunities" o|--|| "t_users" : "createdByUser"
    "t_opportunities" o{--}o "t_articles" : "articles"
    "t_opportunities" o{--}o "t_participations" : "participations"
    "t_opportunities" o{--}o "t_opportunity_slots" : "slots"
    "t_opportunities" o{--}o "t_opportunity_invitations" : "invitations"
    "t_opportunities" o{--}o "t_utilities" : "requiredUtilities"
    "t_opportunity_invitations" o|--|| "t_opportunities" : "opportunity"
    "t_opportunity_invitations" o|--|| "t_users" : "createdByUser"
    "t_opportunity_invitations" o{--}o "t_opportunity_invitation_histories" : "histories"
    "t_opportunity_invitation_histories" o|--|| "t_opportunity_invitations" : "invitation"
    "t_opportunity_invitation_histories" o|--|| "t_users" : "invitedUser"
    "t_opportunity_slots" o|--|o "t_opportunities" : "opportunity"
    "t_opportunity_slots" o{--}o "t_participations" : "participations"
    "t_participations" o|--|| "ParticipationStatus" : "enum:status"
    "t_participations" o|--|| "ParticipationStatusReason" : "enum:reason"
    "t_participations" o|--|o "t_users" : "user"
    "t_participations" o|--|o "t_communities" : "community"
    "t_participations" o|--|o "t_opportunities" : "opportunity"
    "t_participations" o|--|o "t_opportunity_slots" : "opportunitySlot"
    "t_participations" o{--}o "t_participation_status_histories" : "statusHistories"
    "t_participations" o{--}o "t_transactions" : "transactions"
    "t_participation_status_histories" o|--|| "ParticipationStatus" : "enum:status"
    "t_participation_status_histories" o|--|| "ParticipationStatusReason" : "enum:reason"
    "t_participation_status_histories" o|--|| "t_participations" : "participation"
    "t_participation_status_histories" o|--|o "t_users" : "createdByUser"
    "t_places" o|--|| "m_cities" : "city"
    "t_places" o|--|| "t_communities" : "community"
    "t_places" o{--}o "t_opportunities" : "opportunities"
    "t_tickets" o|--|| "TicketStatus" : "enum:status"
    "t_tickets" o|--|| "TicketStatusReason" : "enum:reason"
    "t_tickets" o|--|| "t_wallets" : "wallet"
    "t_tickets" o|--|| "t_utilities" : "utility"
    "t_tickets" o{--}o "t_ticket_status_histories" : "ticketStatusHistories"
    "t_ticket_status_histories" o|--|| "TicketStatus" : "enum:status"
    "t_ticket_status_histories" o|--|| "TicketStatusReason" : "enum:reason"
    "t_ticket_status_histories" o|--|| "t_tickets" : "ticket"
    "t_ticket_status_histories" o|--|o "t_users" : "createdByUser"
    "t_ticket_status_histories" o|--|o "t_transactions" : "transaction"
    "t_transactions" o|--|| "TransactionReason" : "enum:reason"
    "t_transactions" o|--|o "t_wallets" : "fromWallet"
    "t_transactions" o|--|o "t_wallets" : "toWallet"
    "t_transactions" o|--|o "t_participations" : "participation"
    "t_transactions" o{--}o "t_ticket_status_histories" : "ticketStatusHistory"
    "t_identities" o|--|| "IdentityPlatform" : "enum:platform"
    "t_identities" o|--|| "t_users" : "user"
    "t_users" o|--|| "SysRole" : "enum:sys_role"
    "t_users" o{--}o "t_identities" : "identities"
    "t_users" o{--}o "t_memberships" : "memberships"
    "t_users" o{--}o "t_membership_histories" : "membershipHistory"
    "t_users" o{--}o "t_wallets" : "wallets"
    "t_users" o{--}o "t_opportunities" : "opportunitiesCreatedByMe"
    "t_users" o{--}o "t_opportunity_invitations" : "opportunityInvitations"
    "t_users" o{--}o "t_opportunity_invitation_histories" : "opportunityInvitationHistories"
    "t_users" o{--}o "t_participations" : "participations"
    "t_users" o{--}o "t_participation_status_histories" : "participationStatusChangedByMe"
    "t_users" o{--}o "t_articles" : "articlesWrittenByMe"
    "t_users" o{--}o "t_articles" : "articlesAboutMe"
    "t_users" o{--}o "t_ticket_status_histories" : "ticketStatusChangedByMe"
    "t_utilities" o|--|| "PublishStatus" : "enum:publish_status"
    "t_utilities" o|--|| "t_communities" : "community"
    "t_utilities" o{--}o "t_tickets" : "tickets"
    "t_utilities" o{--}o "t_opportunities" : "requiredForOpportunities"
    "mv_current_points" o|--|| "t_wallets" : "wallet"
    "mv_accumulated_points" o|--|| "t_wallets" : "wallet"
```
