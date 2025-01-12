```mermaid
erDiagram

        IdentityPlatform {
            LINE LINE
FACEBOOK FACEBOOK
        }
    


        SysRole {
            SYS_ADMIN SYS_ADMIN
USER USER
        }
    


        Role {
            COMMUNITY_MANAGER COMMUNITY_MANAGER
CONTENT_MANAGER CONTENT_MANAGER
MEMBER MEMBER
        }
    


        PublishStatus {
            PUBLIC PUBLIC
COMMUNITY_INTERNAL COMMUNITY_INTERNAL
PRIVATE PRIVATE
        }
    


        OpportunityCategory {
            EVENT EVENT
TASK TASK
CONVERSATION CONVERSATION
        }
    


        ParticipationStatus {
            APPLIED APPLIED
PARTICIPATING PARTICIPATING
NOT_PARTICIPATING NOT_PARTICIPATING
APPROVED APPROVED
DENIED DENIED
        }
    


        TransactionReason {
            POINT_ISSUED POINT_ISSUED
PARTICIPATION_APPROVED PARTICIPATION_APPROVED
MEMBERSHIP_DELETED MEMBERSHIP_DELETED
GIFT GIFT
OTHER OTHER
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
    String url_you_tube "❓"
    String url_tik_tok "❓"
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
  

  "t_communities" {
    String id "🗝️"
    String name 
    String point_name 
    String image "❓"
    String bio "❓"
    DateTime established_at "❓"
    String website "❓"
    String state_code 
    String state_country_code 
    String city_code 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_memberships" {
    String user_id 
    String community_id 
    Role role 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_wallets" {
    String wallet_id "🗝️"
    String community_id 
    String user_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_opportunities" {
    String id "🗝️"
    String title 
    String description "❓"
    OpportunityCategory category 
    PublishStatus publish_status 
    Boolean require_approval 
    Int capacity "❓"
    Int points_per_participation 
    String image "❓"
    Json files 
    DateTime starts_at "❓"
    DateTime ends_at "❓"
    String community_id 
    String created_by 
    String state_code 
    String state_country_code 
    String city_code 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_participations" {
    String id "🗝️"
    ParticipationStatus status 
    String user_id "❓"
    String community_id "❓"
    String opportunity_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_participation_status_histories" {
    String id "🗝️"
    ParticipationStatus status 
    String participation_id 
    String created_by "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_utilities" {
    String id "🗝️"
    String name 
    String description "❓"
    String image "❓"
    Int points_required 
    String community_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_transactions" {
    String id "🗝️"
    String from "❓"
    Int from_point_change 
    String to "❓"
    Int to_point_change 
    String participation_id "❓"
    String utility_id "❓"
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
    String country_code 
    String name 
    }
  

  "mv_current_point" {
    String walletId "🗝️"
    Int currentPoint 
    }
  
    "t_users" o|--|| "SysRole" : "enum:sys_role"
    "t_users" o{--}o "t_identities" : "identities"
    "t_users" o{--}o "t_memberships" : "memberships"
    "t_users" o{--}o "t_participations" : "participations"
    "t_users" o{--}o "t_opportunities" : "opportunitiesCreatedByMe"
    "t_users" o{--}o "t_wallets" : "wallets"
    "t_users" o{--}o "t_participation_status_histories" : "participationStatusChangeddByMe"
    "t_identities" o|--|| "IdentityPlatform" : "enum:platform"
    "t_identities" o|--|| "t_users" : "user"
    "t_communities" o|--|| "m_states" : "state"
    "t_communities" o|--|| "m_cities" : "city"
    "t_communities" o{--}o "t_memberships" : "memberships"
    "t_communities" o{--}o "t_opportunities" : "ooportunities"
    "t_communities" o{--}o "t_participations" : "participations"
    "t_communities" o{--}o "t_wallets" : "wallets"
    "t_communities" o{--}o "t_utilities" : "utility"
    "t_memberships" o|--|| "t_users" : "user"
    "t_memberships" o|--|| "t_communities" : "community"
    "t_memberships" o|--|| "Role" : "enum:role"
    "t_wallets" o|--|| "t_communities" : "community"
    "t_wallets" o|--|o "t_users" : "user"
    "t_wallets" o{--}o "mv_current_point" : "currentPointView"
    "t_wallets" o{--}o "t_transactions" : "fromTransactions"
    "t_wallets" o{--}o "t_transactions" : "toTransactions"
    "t_opportunities" o|--|| "OpportunityCategory" : "enum:category"
    "t_opportunities" o|--|| "PublishStatus" : "enum:publish_status"
    "t_opportunities" o|--|| "t_communities" : "community"
    "t_opportunities" o|--|| "t_users" : "createdByUser"
    "t_opportunities" o|--|| "m_states" : "state"
    "t_opportunities" o|--|| "m_cities" : "city"
    "t_opportunities" o{--}o "t_participations" : "participations"
    "t_participations" o|--|| "ParticipationStatus" : "enum:status"
    "t_participations" o|--|o "t_users" : "user"
    "t_participations" o|--|o "t_communities" : "community"
    "t_participations" o|--|o "t_opportunities" : "opportunity"
    "t_participations" o{--}o "t_participation_status_histories" : "statusHistories"
    "t_participations" o{--}o "t_transactions" : "transactions"
    "t_participation_status_histories" o|--|| "ParticipationStatus" : "enum:status"
    "t_participation_status_histories" o|--|| "t_participations" : "participation"
    "t_participation_status_histories" o|--|o "t_users" : "createdByUser"
    "t_utilities" o|--|| "t_communities" : "community"
    "t_utilities" o{--}o "t_transactions" : "transactions"
    "t_transactions" o|--|o "t_wallets" : "fromWallet"
    "t_transactions" o|--|o "t_wallets" : "toWallet"
    "t_transactions" o|--|o "t_participations" : "participation"
    "t_transactions" o|--|o "t_utilities" : "utility"
    "m_cities" o|--|| "m_states" : "state"
    "m_cities" o{--}o "t_communities" : "communities"
    "m_cities" o{--}o "t_opportunities" : "opportunities"
    "m_states" o{--}o "m_cities" : "cities"
    "m_states" o{--}o "t_communities" : "communities"
    "m_states" o{--}o "t_opportunities" : "opportunities"
    "mv_current_point" o|--|| "t_wallets" : "wallet"
```
