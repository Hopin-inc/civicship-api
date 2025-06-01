```mermaid
erDiagram

        PublishStatus {
            PUBLIC PUBLIC
COMMUNITY_INTERNAL COMMUNITY_INTERNAL
PRIVATE PRIVATE
        }
    


        Source {
            INTERNAL INTERNAL
EXTERNAL EXTERNAL
        }
    


        SysRole {
            SYS_ADMIN SYS_ADMIN
USER USER
        }
    


        CurrentPrefecture {
            KAGAWA KAGAWA
TOKUSHIMA TOKUSHIMA
KOCHI KOCHI
EHIME EHIME
OUTSIDE_SHIKOKU OUTSIDE_SHIKOKU
UNKNOWN UNKNOWN
        }
    


        IdentityPlatform {
            LINE LINE
FACEBOOK FACEBOOK
PHONE PHONE
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
    


        ParticipationType {
            HOSTED HOSTED
PARTICIPATED PARTICIPATED
        }
    


        WalletType {
            COMMUNITY COMMUNITY
MEMBER MEMBER
        }
    


        ArticleCategory {
            ACTIVITY_REPORT ACTIVITY_REPORT
INTERVIEW INTERVIEW
        }
    


        OpportunityCategory {
            QUEST QUEST
EVENT EVENT
ACTIVITY ACTIVITY
        }
    


        OpportunitySlotHostingStatus {
            SCHEDULED SCHEDULED
CANCELLED CANCELLED
COMPLETED COMPLETED
        }
    


        ReservationStatus {
            APPLIED APPLIED
ACCEPTED ACCEPTED
REJECTED REJECTED
CANCELED CANCELED
        }
    


        ParticipationStatus {
            PENDING PENDING
PARTICIPATING PARTICIPATING
PARTICIPATED PARTICIPATED
NOT_PARTICIPATING NOT_PARTICIPATING
        }
    


        ParticipationStatusReason {
            PERSONAL_RECORD PERSONAL_RECORD
RESERVATION_JOINED RESERVATION_JOINED
RESERVATION_APPLIED RESERVATION_APPLIED
RESERVATION_CANCELED RESERVATION_CANCELED
RESERVATION_ACCEPTED RESERVATION_ACCEPTED
RESERVATION_REJECTED RESERVATION_REJECTED
OPPORTUNITY_CANCELED OPPORTUNITY_CANCELED
        }
    


        EvaluationStatus {
            PENDING PENDING
PASSED PASSED
FAILED FAILED
        }
    


        ClaimLinkStatus {
            ISSUED ISSUED
CLAIMED CLAIMED
EXPIRED EXPIRED
        }
    


        TicketStatus {
            AVAILABLE AVAILABLE
DISABLED DISABLED
        }
    


        TicketStatusReason {
            GIFTED GIFTED
PURCHASED PURCHASED
REFUNDED REFUNDED
RESERVED RESERVED
CANCELED CANCELED
USED USED
EXPIRED EXPIRED
        }
    


        TransactionReason {
            POINT_ISSUED POINT_ISSUED
POINT_REWARD POINT_REWARD
ONBOARDING ONBOARDING
DONATION DONATION
GRANT GRANT
TICKET_PURCHASED TICKET_PURCHASED
TICKET_REFUNDED TICKET_REFUNDED
        }
    
  "t_images" {
    String id "🗝️"
    Boolean is_public 
    String url 
    String original_url "❓"
    String bucket 
    String folder_path 
    String filename 
    Int size "❓"
    Int width "❓"
    Int height "❓"
    String mime 
    String ext 
    String alt "❓"
    String caption "❓"
    Int strapi_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "m_states" {
    String code "🗝️"
    String name 
    String country_code 
    }
  

  "m_cities" {
    String code "🗝️"
    String name 
    String state_code 
    String country_code 
    }
  

  "t_places" {
    String place_id "🗝️"
    String name 
    String address 
    Decimal latitude 
    Decimal longitude 
    String image_id "❓"
    Boolean is_manual 
    String google_place_id "❓"
    Json map_location "❓"
    String city_code 
    String community_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_communities" {
    String id "🗝️"
    String name 
    String point_name 
    String bio "❓"
    DateTime established_at "❓"
    String website "❓"
    String image_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_users" {
    String id "🗝️"
    String name 
    String slug 
    String bio "❓"
    SysRole sys_role 
    CurrentPrefecture current_prefecture 
    String phone_number "❓"
    String url_website "❓"
    String url_x "❓"
    String url_facebook "❓"
    String url_instagram "❓"
    String url_youtube "❓"
    String url_tiktok "❓"
    String image_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_identities" {
    String uid "🗝️"
    IdentityPlatform platform 
    String user_id 
    String auth_token "❓"
    String refresh_token "❓"
    DateTime token_expires_at "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_memberships" {
    String user_id 
    String community_id 
    String headline "❓"
    String bio "❓"
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
    String user_id 
    String community_id 
    String created_by "❓"
    DateTime created_at 
    }
  

  "t_wallets" {
    String wallet_id "🗝️"
    WalletType type 
    String community_id 
    String user_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_articles" {
    String id "🗝️"
    String title 
    String introduction 
    ArticleCategory category 
    PublishStatus publish_status 
    String body 
    DateTime published_at 
    String thumbnail_id "❓"
    String community_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_opportunities" {
    String opportunity_id "🗝️"
    PublishStatus publish_status 
    Boolean require_approval 
    String title 
    OpportunityCategory category 
    String description 
    String body "❓"
    Int points_to_earn "❓"
    Int fee_required "❓"
    String community_id "❓"
    String place_id "❓"
    String created_by 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_opportunity_slots" {
    String slot_id "🗝️"
    OpportunitySlotHostingStatus hosting_status 
    DateTime starts_at 
    DateTime ends_at 
    Int capacity "❓"
    String opportunity_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_reservations" {
    String id "🗝️"
    String opportunity_slot_id 
    String comment "❓"
    ReservationStatus status 
    String created_by "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_reservation_histories" {
    String id "🗝️"
    String reservation_id 
    ReservationStatus status 
    String created_by "❓"
    DateTime created_at 
    }
  

  "t_participations" {
    String id "🗝️"
    Source source 
    ParticipationStatus status 
    ParticipationStatusReason reason 
    String description "❓"
    String user_id "❓"
    String reservation_id "❓"
    String community_id "❓"
    String evaluation_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_participation_status_histories" {
    String id "🗝️"
    String participation_id 
    ParticipationStatus status 
    ParticipationStatusReason reason 
    String created_by "❓"
    DateTime created_at 
    }
  

  "t_evaluations" {
    String id "🗝️"
    EvaluationStatus status 
    String comment "❓"
    String credential_url "❓"
    DateTime issued_at "❓"
    String participation_id 
    String evaluator_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_evaluation_histories" {
    String id "🗝️"
    EvaluationStatus status 
    String comment "❓"
    String evaluation_id 
    String created_by "❓"
    DateTime created_at 
    }
  

  "t_utilities" {
    String id "🗝️"
    PublishStatus publish_status 
    String name 
    String description "❓"
    Int points_required 
    String community_id 
    String owner_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_ticket_issuers" {
    String id "🗝️"
    Int qty_to_be_issued 
    String utility_id 
    String owner_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_ticket_claim_links" {
    String id "🗝️"
    ClaimLinkStatus status 
    Int qty 
    String issuer_id 
    DateTime claimed_at "❓"
    DateTime created_at 
    }
  

  "t_tickets" {
    String id "🗝️"
    TicketStatus status 
    TicketStatusReason reason 
    String wallet_id 
    String utility_id 
    String claim_link_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_ticket_status_histories" {
    String id "🗝️"
    String ticket_id 
    TicketStatus status 
    TicketStatusReason reason 
    String transaction_id "❓"
    String participation_id "❓"
    String created_by "❓"
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
  

  "v_place_public_opportunity_count" {
    String placeId "🗝️"
    Int currentPublicCount 
    }
  

  "v_place_accumulated_participants" {
    String placeId "🗝️"
    Int accumulatedParticipants 
    }
  

  "v_membership_participation_geo" {
    String userId "🗝️"
    String communityId "🗝️"
    ParticipationType type 
    String placeId "🗝️"
    String placeName "❓"
    String placeImage "❓"
    String address 
    Decimal latitude 
    Decimal longitude 
    }
  

  "v_membership_participation_count" {
    String userId "🗝️"
    String communityId "🗝️"
    ParticipationType type "🗝️"
    Int totalCount 
    }
  

  "v_membership_hosted_opportunity_count" {
    String userId "🗝️"
    String communityId "🗝️"
    Int totalCount 
    }
  

  "mv_current_points" {
    String walletId "🗝️"
    Int currentPoint 
    }
  

  "mv_accumulated_points" {
    String walletId "🗝️"
    Int accumulatedPoint 
    }
  

  "v_earliest_reservable_slot" {
    String opportunityId "🗝️"
    DateTime earliestReservableAt "❓"
    }
  

  "v_opportunity_accumulated_participants" {
    String opportunityId "🗝️"
    Int accumulatedParticipants 
    }
  

  "v_slot_remaining_capacity" {
    String slotId "🗝️"
    Int remainingCapacity "❓"
    }
  
    "t_images" o{--}o "t_users" : "users"
    "t_images" o{--}o "t_communities" : "communities"
    "t_images" o{--}o "t_articles" : "articles"
    "t_images" o{--}o "t_places" : "places"
    "t_images" o{--}o "t_opportunities" : "opportunities"
    "t_images" o{--}o "t_participations" : "participations"
    "t_images" o{--}o "t_utilities" : "utilities"
    "m_states" o{--}o "m_cities" : "cities"
    "m_cities" o|--|| "m_states" : "state"
    "m_cities" o{--}o "t_places" : "places"
    "t_places" o|--|o "t_images" : "image"
    "t_places" o|--|| "m_cities" : "city"
    "t_places" o|--|o "t_communities" : "community"
    "t_places" o{--}o "t_opportunities" : "opportunities"
    "t_places" o{--}o "v_place_public_opportunity_count" : "currentPublicOpportunityCount"
    "t_places" o{--}o "v_place_accumulated_participants" : "accumulated_participants"
    "t_communities" o|--|o "t_images" : "image"
    "t_communities" o{--}o "t_places" : "places"
    "t_communities" o{--}o "t_memberships" : "memberships"
    "t_communities" o{--}o "t_wallets" : "wallets"
    "t_communities" o{--}o "t_utilities" : "utilities"
    "t_communities" o{--}o "t_opportunities" : "opportunities"
    "t_communities" o{--}o "t_participations" : "participations"
    "t_communities" o{--}o "t_articles" : "articles"
    "t_users" o|--|| "SysRole" : "enum:sys_role"
    "t_users" o|--|| "CurrentPrefecture" : "enum:current_prefecture"
    "t_users" o|--|o "t_images" : "image"
    "t_users" o{--}o "t_identities" : "identities"
    "t_users" o{--}o "t_memberships" : "memberships"
    "t_users" o{--}o "t_membership_histories" : "membershipChangedByMe"
    "t_users" o{--}o "t_wallets" : "wallets"
    "t_users" o{--}o "t_utilities" : "utiltyOwnedByMe"
    "t_users" o{--}o "t_ticket_issuers" : "ticketIssuedByMe"
    "t_users" o{--}o "t_ticket_status_histories" : "ticketStatusChangedByMe"
    "t_users" o{--}o "t_opportunities" : "opportunitiesCreatedByMe"
    "t_users" o{--}o "t_reservations" : "reservationsAppliedByMe"
    "t_users" o{--}o "t_reservation_histories" : "reservationStatusChangedByMe"
    "t_users" o{--}o "t_participations" : "participations"
    "t_users" o{--}o "t_participation_status_histories" : "participationStatusChangedByMe"
    "t_users" o{--}o "t_evaluations" : "evaluationsEvaluatedByMe"
    "t_users" o{--}o "t_evaluation_histories" : "evaluationCreatedByMe"
    "t_users" o{--}o "t_articles" : "articlesWrittenByMe"
    "t_users" o{--}o "t_articles" : "articlesAboutMe"
    "t_identities" o|--|| "IdentityPlatform" : "enum:platform"
    "t_identities" o|--|| "t_users" : "user"
    "t_memberships" o|--|| "t_users" : "user"
    "t_memberships" o|--|| "t_communities" : "community"
    "t_memberships" o|--|| "MembershipStatus" : "enum:status"
    "t_memberships" o|--|| "MembershipStatusReason" : "enum:reason"
    "t_memberships" o|--|| "Role" : "enum:role"
    "t_memberships" o{--}o "t_membership_histories" : "histories"
    "t_memberships" o{--}o "v_membership_hosted_opportunity_count" : "opportunityHostedCountView"
    "t_memberships" o{--}o "v_membership_participation_geo" : "participationGeoViews"
    "t_memberships" o{--}o "v_membership_participation_count" : "participationCountViews"
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
    "t_articles" o|--|| "ArticleCategory" : "enum:category"
    "t_articles" o|--|| "PublishStatus" : "enum:publish_status"
    "t_articles" o|--|o "t_images" : "thumbnail"
    "t_articles" o|--|| "t_communities" : "community"
    "t_articles" o{--}o "t_users" : "authors"
    "t_articles" o{--}o "t_users" : "relatedUsers"
    "t_articles" o{--}o "t_opportunities" : "opportunities"
    "t_opportunities" o|--|| "PublishStatus" : "enum:publish_status"
    "t_opportunities" o|--|| "OpportunityCategory" : "enum:category"
    "t_opportunities" o{--}o "t_images" : "images"
    "t_opportunities" o{--}o "t_utilities" : "requiredUtilities"
    "t_opportunities" o{--}o "t_opportunity_slots" : "slots"
    "t_opportunities" o{--}o "v_earliest_reservable_slot" : "earliestReservableSlotView"
    "t_opportunities" o{--}o "v_opportunity_accumulated_participants" : "accumulated_participants"
    "t_opportunities" o|--|o "t_communities" : "community"
    "t_opportunities" o|--|o "t_places" : "place"
    "t_opportunities" o{--}o "t_articles" : "articles"
    "t_opportunities" o|--|| "t_users" : "createdByUser"
    "t_opportunity_slots" o|--|| "OpportunitySlotHostingStatus" : "enum:hosting_status"
    "t_opportunity_slots" o{--}o "v_slot_remaining_capacity" : "remainingCapacityView"
    "t_opportunity_slots" o|--|| "t_opportunities" : "opportunity"
    "t_opportunity_slots" o{--}o "t_reservations" : "reservations"
    "t_reservations" o|--|| "t_opportunity_slots" : "opportunitySlot"
    "t_reservations" o|--|| "ReservationStatus" : "enum:status"
    "t_reservations" o{--}o "t_participations" : "participations"
    "t_reservations" o|--|o "t_users" : "createdByUser"
    "t_reservations" o{--}o "t_reservation_histories" : "histories"
    "t_reservation_histories" o|--|| "t_reservations" : "reservation"
    "t_reservation_histories" o|--|| "ReservationStatus" : "enum:status"
    "t_reservation_histories" o|--|o "t_users" : "createdByUser"
    "t_participations" o|--|| "Source" : "enum:source"
    "t_participations" o|--|| "ParticipationStatus" : "enum:status"
    "t_participations" o|--|| "ParticipationStatusReason" : "enum:reason"
    "t_participations" o{--}o "t_images" : "images"
    "t_participations" o|--|o "t_users" : "user"
    "t_participations" o|--|o "t_reservations" : "reservation"
    "t_participations" o{--}o "t_ticket_status_histories" : "ticketStatusHistories"
    "t_participations" o|--|o "t_communities" : "community"
    "t_participations" o{--}o "t_evaluations" : "evaluation"
    "t_participations" o{--}o "t_transactions" : "transactions"
    "t_participations" o{--}o "t_participation_status_histories" : "statusHistories"
    "t_participation_status_histories" o|--|| "t_participations" : "participation"
    "t_participation_status_histories" o|--|| "ParticipationStatus" : "enum:status"
    "t_participation_status_histories" o|--|| "ParticipationStatusReason" : "enum:reason"
    "t_participation_status_histories" o|--|o "t_users" : "createdByUser"
    "t_evaluations" o|--|| "EvaluationStatus" : "enum:status"
    "t_evaluations" o|--|| "t_participations" : "participation"
    "t_evaluations" o|--|| "t_users" : "evaluator"
    "t_evaluations" o{--}o "t_evaluation_histories" : "histories"
    "t_evaluation_histories" o|--|| "EvaluationStatus" : "enum:status"
    "t_evaluation_histories" o|--|| "t_evaluations" : "evaluation"
    "t_evaluation_histories" o|--|o "t_users" : "createdByUser"
    "t_utilities" o|--|| "PublishStatus" : "enum:publish_status"
    "t_utilities" o{--}o "t_images" : "images"
    "t_utilities" o|--|| "t_communities" : "community"
    "t_utilities" o{--}o "t_opportunities" : "requiredForOpportunities"
    "t_utilities" o{--}o "t_ticket_issuers" : "ticketIssuer"
    "t_utilities" o{--}o "t_tickets" : "tickets"
    "t_utilities" o|--|o "t_users" : "owner"
    "t_ticket_issuers" o|--|| "t_utilities" : "utility"
    "t_ticket_issuers" o|--|| "t_users" : "owner"
    "t_ticket_issuers" o{--}o "t_ticket_claim_links" : "claimLink"
    "t_ticket_claim_links" o|--|| "ClaimLinkStatus" : "enum:status"
    "t_ticket_claim_links" o|--|| "t_ticket_issuers" : "issuer"
    "t_ticket_claim_links" o{--}o "t_tickets" : "tickets"
    "t_tickets" o|--|| "TicketStatus" : "enum:status"
    "t_tickets" o|--|| "TicketStatusReason" : "enum:reason"
    "t_tickets" o|--|| "t_wallets" : "wallet"
    "t_tickets" o|--|| "t_utilities" : "utility"
    "t_tickets" o|--|o "t_ticket_claim_links" : "claimLink"
    "t_tickets" o{--}o "t_ticket_status_histories" : "ticketStatusHistories"
    "t_ticket_status_histories" o|--|| "t_tickets" : "ticket"
    "t_ticket_status_histories" o|--|| "TicketStatus" : "enum:status"
    "t_ticket_status_histories" o|--|| "TicketStatusReason" : "enum:reason"
    "t_ticket_status_histories" o|--|o "t_transactions" : "transaction"
    "t_ticket_status_histories" o|--|o "t_participations" : "participation"
    "t_ticket_status_histories" o|--|o "t_users" : "createdByUser"
    "t_transactions" o|--|| "TransactionReason" : "enum:reason"
    "t_transactions" o|--|o "t_wallets" : "fromWallet"
    "t_transactions" o|--|o "t_wallets" : "toWallet"
    "t_transactions" o|--|o "t_participations" : "participation"
    "t_transactions" o{--}o "t_ticket_status_histories" : "ticketStatusHistory"
    "v_place_public_opportunity_count" o|--|| "t_places" : "place"
    "v_place_accumulated_participants" o|--|| "t_places" : "place"
    "v_membership_participation_geo" o|--|| "ParticipationType" : "enum:type"
    "v_membership_participation_geo" o|--|| "t_memberships" : "membership"
    "v_membership_participation_count" o|--|| "ParticipationType" : "enum:type"
    "v_membership_participation_count" o|--|| "t_memberships" : "membership"
    "v_membership_hosted_opportunity_count" o|--|| "t_memberships" : "membership"
    "mv_current_points" o|--|| "t_wallets" : "wallet"
    "mv_accumulated_points" o|--|| "t_wallets" : "wallet"
    "v_earliest_reservable_slot" o|--|| "t_opportunities" : "opportunity"
    "v_opportunity_accumulated_participants" o|--|| "t_opportunities" : "opportunity"
    "v_slot_remaining_capacity" o|--|| "t_opportunity_slots" : "slot"
```
