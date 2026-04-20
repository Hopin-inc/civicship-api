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
    


        LineRichMenuType {
            ADMIN ADMIN
USER USER
PUBLIC PUBLIC
        }
    


        Language {
            JA JA
EN EN
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
    


        DIDIssuanceStatus {
            PENDING PENDING
PROCESSING PROCESSING
COMPLETED COMPLETED
FAILED FAILED
        }
    


        VCIssuanceStatus {
            PENDING PENDING
PROCESSING PROCESSING
COMPLETED COMPLETED
FAILED FAILED
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
OPPORTUNITY_RESERVATION_CREATED OPPORTUNITY_RESERVATION_CREATED
OPPORTUNITY_RESERVATION_CANCELED OPPORTUNITY_RESERVATION_CANCELED
OPPORTUNITY_RESERVATION_REJECTED OPPORTUNITY_RESERVATION_REJECTED
        }
    


        IncentiveGrantType {
            SIGNUP SIGNUP
        }
    


        IncentiveGrantStatus {
            PENDING PENDING
RETRYING RETRYING
COMPLETED COMPLETED
FAILED FAILED
        }
    


        IncentiveGrantFailureCode {
            INSUFFICIENT_FUNDS INSUFFICIENT_FUNDS
WALLET_NOT_FOUND WALLET_NOT_FOUND
DATABASE_ERROR DATABASE_ERROR
TIMEOUT TIMEOUT
UNKNOWN UNKNOWN
        }
    


        NftWalletType {
            INTERNAL INTERNAL
EXTERNAL EXTERNAL
        }
    


        NftInstanceStatus {
            STOCK STOCK
RESERVED RESERVED
MINTING MINTING
OWNED OWNED
RETIRED RETIRED
        }
    


        NftMintStatus {
            QUEUED QUEUED
SUBMITTED SUBMITTED
MINTED MINTED
FAILED FAILED
        }
    


        Position {
            LEFT LEFT
RIGHT RIGHT
        }
    


        vote_gate_type {
            NFT NFT
MEMBERSHIP MEMBERSHIP
        }
    


        vote_power_policy_type {
            FLAT FLAT
NFT_COUNT NFT_COUNT
        }
    


        ReportTemplateScope {
            SYSTEM SYSTEM
COMMUNITY COMMUNITY
        }
    


        ReportTemplateKind {
            GENERATION GENERATION
JUDGE JUDGE
        }
    


        ReportStatus {
            DRAFT DRAFT
APPROVED APPROVED
PUBLISHED PUBLISHED
REJECTED REJECTED
SUPERSEDED SUPERSEDED
SKIPPED SKIPPED
        }
    


        FeedbackType {
            QUALITY QUALITY
ACCURACY ACCURACY
TONE TONE
STRUCTURE STRUCTURE
OTHER OTHER
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
  

  "t_community_configs" {
    String id "🗝️"
    String community_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_community_firebase_configs" {
    String id "🗝️"
    String config_id 
    String tenant_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_community_line_configs" {
    String id "🗝️"
    String config_id 
    String channel_id 
    String channel_secret 
    String access_token 
    String liff_id 
    String liff_app_id "❓"
    String liff_base_url 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_community_line_rich_menus" {
    String id "🗝️"
    String config_id 
    LineRichMenuType type 
    String rich_menu_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_community_portal_configs" {
    String id "🗝️"
    String config_id 
    String token_name 
    String title 
    String description 
    String short_description "❓"
    String domain 
    String favicon_prefix 
    String logo_path 
    String square_logo_path 
    String og_image_path 
    Json enable_features 
    String root_path 
    String admin_root_path 
    Json documents "❓"
    Json common_document_overrides "❓"
    String region_name "❓"
    String region_key "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_community_signup_bonus_configs" {
    String id "🗝️"
    String community_id 
    Boolean is_enabled 
    Int bonus_point 
    String message "❓"
    DateTime created_at 
    DateTime updated_at 
    }
  

  "t_users" {
    String id "🗝️"
    String name 
    String slug 
    String bio "❓"
    SysRole sys_role 
    CurrentPrefecture current_prefecture 
    String phone_number "❓"
    Language preferred_language 
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
    String id "🗝️"
    String uid 
    IdentityPlatform platform 
    String user_id 
    String community_id "❓"
    String auth_token "❓"
    String refresh_token "❓"
    DateTime token_expires_at "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_did_issuance_requests" {
    String id "🗝️"
    DidIssuanceStatus status 
    String job_id "❓"
    String did_value "❓"
    String error_message "❓"
    Int retry_count 
    DateTime requested_at 
    DateTime processed_at "❓"
    DateTime completed_at "❓"
    String user_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_vc_issuance_requests" {
    String id "🗝️"
    VcIssuanceStatus status 
    String job_id "❓"
    String vc_record_id "❓"
    Json claims 
    String credential_format "❓"
    String schema_id "❓"
    String error_message "❓"
    Int retry_count 
    DateTime requested_at 
    DateTime processed_at "❓"
    DateTime completed_at "❓"
    String evaluation_id 
    String user_id 
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
    Int points_required "❓"
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
    Int participant_count_with_point 
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
    String opportunity_slot_id "❓"
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
    String comment "❓"
    String from "❓"
    Int from_point_change 
    String to "❓"
    Int to_point_change 
    String parent_tx_id "❓"
    Int chain_depth "❓"
    String participation_id "❓"
    String reservation_id "❓"
    String created_by "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_incentive_grants" {
    String id "🗝️"
    IncentiveGrantType type 
    String source_id 
    IncentiveGrantStatus status 
    String user_id 
    String community_id 
    IncentiveGrantFailureCode failure_code "❓"
    String last_error "❓"
    Int attempt_count 
    DateTime last_attempted_at "❓"
    String transaction_id "❓"
    DateTime created_at 
    DateTime updated_at 
    }
  

  "m_api_keys" {
    String id "🗝️"
    String key 
    String name 
    Boolean is_active 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_nft_wallets" {
    String id "🗝️"
    NftWalletType type 
    String wallet_address 
    String user_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_nft_tokens" {
    String id "🗝️"
    String address 
    String type 
    String name "❓"
    String symbol "❓"
    Json json "❓"
    String community_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_nft_instances" {
    String id "🗝️"
    String instance_id 
    Int sequence_num "❓"
    NftInstanceStatus status 
    String name "❓"
    String description "❓"
    String image_url "❓"
    Json json "❓"
    String nft_token_id 
    String nft_wallet_id "❓"
    String community_id "❓"
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_nft_mints" {
    String id "🗝️"
    NftMintStatus status 
    String tx_hash "❓"
    String error "❓"
    Int retry_count 
    String external_request_id "❓"
    String nft_instance_id 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_merkle_commits" {
    String id "🗝️"
    String root_hash 
    Int label 
    DateTime period_start 
    DateTime period_end 
    DateTime committed_at 
    }
  

  "t_merkle_proofs" {
    String id "🗝️"
    String tx_id 
    String commit_id 
    Int index 
    String sibling 
    Position position 
    }
  

  "t_vote_gates" {
    String id "🗝️"
    VoteGateType type 
    String nft_token_id "❓"
    Role required_role "❓"
    String topic_id 
    }
  

  "t_vote_power_policies" {
    String id "🗝️"
    VotePowerPolicyType type 
    String nft_token_id "❓"
    String topic_id 
    }
  

  "t_vote_topics" {
    String id "🗝️"
    String community_id 
    String created_by 
    String title 
    String description "❓"
    DateTime starts_at 
    DateTime ends_at 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_vote_options" {
    String id "🗝️"
    String topic_id 
    String label 
    Int order_index 
    Int vote_count 
    Int total_power 
    }
  

  "t_vote_ballots" {
    String id "🗝️"
    String user_id 
    String topic_id 
    String option_id 
    Int power 
    DateTime created_at 
    DateTime updated_at "❓"
    }
  

  "t_report_templates" {
    String id "🗝️"
    String variant 
    ReportTemplateScope scope 
    ReportTemplateKind kind 
    String community_id "❓"
    String system_prompt 
    String user_prompt_template 
    String community_context "❓"
    String model 
    Float temperature "❓"
    Int maxTokens 
    String stopSequences 
    Boolean isEnabled 
    Int version 
    Boolean isActive 
    String experimentKey "❓"
    Int trafficWeight 
    String notes "❓"
    String updatedBy "❓"
    DateTime createdAt 
    DateTime updatedAt "❓"
    }
  

  "t_reports" {
    String id "🗝️"
    String community_id 
    String variant 
    DateTime period_from 
    DateTime period_to 
    String template_id "❓"
    Json input_payload 
    String outputMarkdown "❓"
    String model "❓"
    String systemPromptSnapshot "❓"
    String userPromptSnapshot "❓"
    String communityContextSnapshot "❓"
    Int inputTokens "❓"
    Int outputTokens "❓"
    Int cacheReadTokens "❓"
    Int judgeScore "❓"
    Json judgeBreakdown "❓"
    String judgeTemplateId "❓"
    Json coverageJson "❓"
    String skipReason "❓"
    String targetUserId "❓"
    String generatedBy "❓"
    ReportStatus status 
    DateTime publishedAt "❓"
    String publishedBy "❓"
    String finalContent "❓"
    Int regenerateCount 
    String parentRunId "❓"
    DateTime createdAt 
    DateTime updatedAt "❓"
    }
  

  "t_report_feedbacks" {
    String id "🗝️"
    String report_id 
    String user_id 
    Int rating 
    FeedbackType feedback_type "❓"
    String section_key "❓"
    String comment "❓"
    DateTime created_at 
    }
  

  "t_report_golden_cases" {
    String id "🗝️"
    String variant 
    String label 
    Json payload_fixture 
    Json judge_criteria 
    Int min_judge_score 
    String forbidden_keys 
    String notes "❓"
    ReportStatus expected_status "❓"
    Int template_version "❓"
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
    BigInt currentPoint 
    }
  

  "mv_accumulated_points" {
    String walletId "🗝️"
    BigInt accumulatedPoint 
    }
  

  "mv_transaction_summary_daily" {
    DateTime date "🗝️"
    String communityId "🗝️"
    TransactionReason reason "🗝️"
    Int txCount 
    BigInt pointsSum 
    Int chainRootCount 
    Int chainDescendantCount 
    Int maxChainDepth "❓"
    Int sumChainDepth 
    Int issuanceCount 
    Int burnCount 
    }
  

  "mv_user_transaction_daily" {
    DateTime date "🗝️"
    String communityId "🗝️"
    String userId "🗝️"
    String walletId "🗝️"
    Int txCountIn 
    Int txCountOut 
    BigInt pointsIn 
    BigInt pointsOut 
    Int donationOutCount 
    BigInt donationOutPoints 
    Int receivedDonationCount 
    Int chainRootCount 
    Int maxChainDepthStarted "❓"
    Int chainDepthReachedMax "❓"
    Int uniqueCounterparties 
    }
  

  "v_transaction_comments" {
    String transactionId "🗝️"
    DateTime date 
    DateTime createdAt 
    String communityId 
    String fromUserId "❓"
    String toUserId "❓"
    String createdByUserId "❓"
    TransactionReason reason 
    Int points 
    String comment 
    Int chainDepth "❓"
    }
  

  "v_user_profile_for_report" {
    String userId "🗝️"
    String communityId "🗝️"
    String name 
    String userBio "❓"
    String membershipBio "❓"
    String headline "❓"
    Role role 
    DateTime joinedAt 
    }
  

  "v_user_cohort" {
    String communityId "🗝️"
    String userId "🗝️"
    DateTime onboardingWeek 
    DateTime firstActiveWeek "❓"
    Float totalWeeksInCommunity "❓"
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
  
    "t_images" o{--}o "t_opportunities" : ""
    "t_images" o{--}o "t_participations" : ""
    "t_images" o{--}o "t_utilities" : ""
    "t_images" o{--}o "t_transactions" : ""
    "m_cities" }o--|| m_states : "state"
    "t_places" }o--|o t_images : "image"
    "t_places" }o--|| m_cities : "city"
    "t_places" }o--|o t_communities : "community"
    "t_communities" }o--|o t_images : "image"
    "t_community_configs" |o--|| t_communities : "community"
    "t_community_firebase_configs" |o--|o t_community_configs : "config"
    "t_community_line_configs" |o--|o t_community_configs : "config"
    "t_community_line_rich_menus" }o--|| t_community_line_configs : "config"
    "t_community_line_rich_menus" |o--|| "LineRichMenuType" : "enum:type"
    "t_community_portal_configs" |o--|| t_community_configs : "config"
    "t_community_signup_bonus_configs" |o--|| t_communities : "community"
    "t_users" |o--|| "SysRole" : "enum:sys_role"
    "t_users" |o--|| "CurrentPrefecture" : "enum:current_prefecture"
    "t_users" |o--|| "Language" : "enum:preferred_language"
    "t_users" }o--|o t_images : "image"
    "t_users" o{--}o "t_articles" : ""
    "t_users" o{--}o "t_articles" : ""
    "t_identities" |o--|| "IdentityPlatform" : "enum:platform"
    "t_identities" }o--|| t_users : "user"
    "t_identities" }o--|o t_communities : "community"
    "t_did_issuance_requests" |o--|| "DidIssuanceStatus" : "enum:status"
    "t_did_issuance_requests" }o--|| t_users : "user"
    "t_vc_issuance_requests" |o--|| "VcIssuanceStatus" : "enum:status"
    "t_vc_issuance_requests" |o--|| t_evaluations : "evaluation"
    "t_vc_issuance_requests" }o--|| t_users : "user"
    "t_memberships" }o--|| t_users : "user"
    "t_memberships" }o--|| t_communities : "community"
    "t_memberships" |o--|| "MembershipStatus" : "enum:status"
    "t_memberships" |o--|| "MembershipStatusReason" : "enum:reason"
    "t_memberships" |o--|| "Role" : "enum:role"
    "t_membership_histories" |o--|| "Role" : "enum:role"
    "t_membership_histories" |o--|| "MembershipStatus" : "enum:status"
    "t_membership_histories" |o--|| "MembershipStatusReason" : "enum:reason"
    "t_membership_histories" }o--|| t_memberships : "membership"
    "t_membership_histories" }o--|o t_users : "createdByUser"
    "t_wallets" |o--|| "WalletType" : "enum:type"
    "t_wallets" }o--|| t_communities : "community"
    "t_wallets" }o--|o t_users : "user"
    "t_articles" |o--|| "ArticleCategory" : "enum:category"
    "t_articles" |o--|| "PublishStatus" : "enum:publish_status"
    "t_articles" }o--|o t_images : "thumbnail"
    "t_articles" }o--|| t_communities : "community"
    "t_articles" o{--}o "t_opportunities" : ""
    "t_opportunities" |o--|| "PublishStatus" : "enum:publish_status"
    "t_opportunities" |o--|| "OpportunityCategory" : "enum:category"
    "t_opportunities" o{--}o "t_utilities" : ""
    "t_opportunities" }o--|o t_communities : "community"
    "t_opportunities" }o--|o t_places : "place"
    "t_opportunities" }o--|| t_users : "createdByUser"
    "t_opportunity_slots" |o--|| "OpportunitySlotHostingStatus" : "enum:hosting_status"
    "t_opportunity_slots" }o--|| t_opportunities : "opportunity"
    "t_reservations" }o--|| t_opportunity_slots : "opportunitySlot"
    "t_reservations" |o--|| "ReservationStatus" : "enum:status"
    "t_reservations" }o--|o t_users : "createdByUser"
    "t_reservation_histories" }o--|| t_reservations : "reservation"
    "t_reservation_histories" |o--|| "ReservationStatus" : "enum:status"
    "t_reservation_histories" }o--|o t_users : "createdByUser"
    "t_participations" |o--|| "Source" : "enum:source"
    "t_participations" |o--|| "ParticipationStatus" : "enum:status"
    "t_participations" |o--|| "ParticipationStatusReason" : "enum:reason"
    "t_participations" }o--|o t_users : "user"
    "t_participations" }o--|o t_opportunity_slots : "opportunitySlot"
    "t_participations" }o--|o t_reservations : "reservation"
    "t_participations" }o--|o t_communities : "community"
    "t_participation_status_histories" }o--|| t_participations : "participation"
    "t_participation_status_histories" |o--|| "ParticipationStatus" : "enum:status"
    "t_participation_status_histories" |o--|| "ParticipationStatusReason" : "enum:reason"
    "t_participation_status_histories" }o--|o t_users : "createdByUser"
    "t_evaluations" |o--|| "EvaluationStatus" : "enum:status"
    "t_evaluations" |o--|| t_participations : "participation"
    "t_evaluations" }o--|| t_users : "evaluator"
    "t_evaluation_histories" |o--|| "EvaluationStatus" : "enum:status"
    "t_evaluation_histories" }o--|| t_evaluations : "evaluation"
    "t_evaluation_histories" }o--|o t_users : "createdByUser"
    "t_utilities" |o--|| "PublishStatus" : "enum:publish_status"
    "t_utilities" }o--|| t_communities : "community"
    "t_utilities" }o--|o t_users : "owner"
    "t_ticket_issuers" }o--|| t_utilities : "utility"
    "t_ticket_issuers" }o--|| t_users : "owner"
    "t_ticket_claim_links" |o--|| "ClaimLinkStatus" : "enum:status"
    "t_ticket_claim_links" |o--|| t_ticket_issuers : "issuer"
    "t_tickets" |o--|| "TicketStatus" : "enum:status"
    "t_tickets" |o--|| "TicketStatusReason" : "enum:reason"
    "t_tickets" }o--|| t_wallets : "wallet"
    "t_tickets" }o--|| t_utilities : "utility"
    "t_tickets" }o--|o t_ticket_claim_links : "claimLink"
    "t_ticket_status_histories" }o--|| t_tickets : "ticket"
    "t_ticket_status_histories" |o--|| "TicketStatus" : "enum:status"
    "t_ticket_status_histories" |o--|| "TicketStatusReason" : "enum:reason"
    "t_ticket_status_histories" |o--|o t_transactions : "transaction"
    "t_ticket_status_histories" }o--|o t_participations : "participation"
    "t_ticket_status_histories" }o--|o t_users : "createdByUser"
    "t_transactions" |o--|| "TransactionReason" : "enum:reason"
    "t_transactions" }o--|o t_wallets : "fromWallet"
    "t_transactions" }o--|o t_wallets : "toWallet"
    "t_transactions" |o--|o t_transactions : "parentTx"
    "t_transactions" }o--|o t_participations : "participation"
    "t_transactions" }o--|o t_reservations : "reservation"
    "t_transactions" }o--|o t_users : "createdByUser"
    "t_incentive_grants" |o--|| "IncentiveGrantType" : "enum:type"
    "t_incentive_grants" |o--|| "IncentiveGrantStatus" : "enum:status"
    "t_incentive_grants" }o--|| t_users : "user"
    "t_incentive_grants" }o--|| t_communities : "community"
    "t_incentive_grants" |o--|o "IncentiveGrantFailureCode" : "enum:failure_code"
    "t_incentive_grants" |o--|o t_transactions : "transaction"
    "t_nft_wallets" |o--|| "NftWalletType" : "enum:type"
    "t_nft_wallets" }o--|| t_users : "user"
    "t_nft_tokens" }o--|o t_communities : "community"
    "t_nft_instances" |o--|| "NftInstanceStatus" : "enum:status"
    "t_nft_instances" }o--|| t_nft_tokens : "nftToken"
    "t_nft_instances" }o--|o t_nft_wallets : "nftWallet"
    "t_nft_instances" }o--|o t_communities : "community"
    "t_nft_mints" |o--|| "NftMintStatus" : "enum:status"
    "t_nft_mints" }o--|| t_nft_instances : "nftInstance"
    "t_merkle_proofs" }o--|| t_transactions : "tx"
    "t_merkle_proofs" }o--|| t_merkle_commits : "commit"
    "t_merkle_proofs" |o--|| "Position" : "enum:position"
    "t_vote_gates" |o--|| "VoteGateType" : "enum:type"
    "t_vote_gates" }o--|o t_nft_tokens : "nftToken"
    "t_vote_gates" |o--|o "Role" : "enum:required_role"
    "t_vote_gates" |o--|| t_vote_topics : "topic"
    "t_vote_power_policies" |o--|| "VotePowerPolicyType" : "enum:type"
    "t_vote_power_policies" }o--|o t_nft_tokens : "nftToken"
    "t_vote_power_policies" |o--|| t_vote_topics : "topic"
    "t_vote_topics" }o--|| t_communities : "community"
    "t_vote_topics" }o--|| t_users : "createdByUser"
    "t_vote_options" }o--|| t_vote_topics : "topic"
    "t_vote_ballots" }o--|| t_users : "user"
    "t_vote_ballots" }o--|| t_vote_topics : "topic"
    "t_vote_ballots" }o--|| t_vote_options : "option"
    "t_report_templates" |o--|| "ReportTemplateScope" : "enum:scope"
    "t_report_templates" |o--|| "ReportTemplateKind" : "enum:kind"
    "t_report_templates" }o--|o t_communities : "community"
    "t_report_templates" }o--|o t_users : "updatedByUser"
    "t_reports" }o--|| t_communities : "community"
    "t_reports" }o--|o t_report_templates : "template"
    "t_reports" }o--|o t_report_templates : "judgeTemplate"
    "t_reports" }o--|o t_users : "targetUser"
    "t_reports" }o--|o t_users : "generatedByUser"
    "t_reports" |o--|| "ReportStatus" : "enum:status"
    "t_reports" }o--|o t_users : "publishedByUser"
    "t_reports" |o--|o t_reports : "parentRun"
    "t_report_feedbacks" }o--|| t_reports : "report"
    "t_report_feedbacks" }o--|| t_users : "user"
    "t_report_feedbacks" |o--|o "FeedbackType" : "enum:feedback_type"
    "t_report_golden_cases" |o--|o "ReportStatus" : "enum:expected_status"
    "v_place_public_opportunity_count" |o--|| t_places : "place"
    "v_place_accumulated_participants" |o--|| t_places : "place"
    "v_membership_participation_geo" |o--|| "ParticipationType" : "enum:type"
    "v_membership_participation_geo" }o--|| t_memberships : "membership"
    "v_membership_participation_count" |o--|| "ParticipationType" : "enum:type"
    "v_membership_participation_count" }o--|| t_memberships : "membership"
    "v_membership_hosted_opportunity_count" |o--|| t_memberships : "membership"
    "mv_current_points" |o--|| t_wallets : "wallet"
    "mv_accumulated_points" |o--|| t_wallets : "wallet"
    "mv_transaction_summary_daily" |o--|| "TransactionReason" : "enum:reason"
    "v_transaction_comments" |o--|| "TransactionReason" : "enum:reason"
    "v_user_profile_for_report" |o--|| "Role" : "enum:role"
    "v_earliest_reservable_slot" |o--|| t_opportunities : "opportunity"
    "v_opportunity_accumulated_participants" |o--|| t_opportunities : "opportunity"
    "v_slot_remaining_capacity" |o--|| t_opportunity_slots : "slot"
```
