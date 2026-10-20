# Governance control metrics

All targets are proposed controls. A value of `not_yet_measured` means the measurement method is defined but no production observation has been recorded yet.

| Control | Metric | Target | Direction | Unit | Source | Window |
|---|---|---:|---|---|---|---|
| CHG-01 | feature_spec_acceptance_coverage | 100 | at_least | % | change records and requirement links | per change |
| CHG-02 | changes_with_required_review | 100 | at_least | % | pull-request review metadata | per change |
| CHG-03 | review_evidence_completeness | 100 | at_least | % | change-control record | per quarter |
| CHG-04 | emergency_post_review_timeliness | 5 | at_most | business_days | incident tracker | per emergency change |
| CHG-05 | plan_retention_compliance | 100 | at_least | % | repository audit | per quarter |
| COL-01 | meetings_with_published_notes | 100 | at_least | % | meeting notes index | per meeting |
| COL-02 | records_with_current_classification | 100 | at_least | % | records register | per quarter |
| COL-03 | escalation_acknowledgement_time | 1 | at_most | business_days | escalation log | per escalation |
| DOC-05 | design_reviews_before_release | 100 | at_least | % | design review log | per release |
| EXT-01 | support_first_response_time | 1 | at_most | business_days | ticket system | per ticket |
| EXT-02 | complaints_resolved | 10 | at_most | business_days | complaint log | per complaint |
| EXT-03 | public_claims_with_marketing_approval | 100 | at_least | % | marketing approval log | per claim |
| EXT-04 | incident_notification_time | 24 | at_most | hours | incident log | per incident |
| MEDIA-03 | assets_using_approved_templates | 100 | at_least | % | asset registry | per release |
| OPS-06 | on_call_coverage | 100 | at_least | % | on-call rota | per week |
| ORG-01 | roles_with_decision_rights | 100 | at_least | % | role register | per quarter |
| ORG-02 | annual_conflict_disclosures | 100 | at_least | % | attestation system | per year |
| ORG-03 | obligations_reviewed_on_schedule | 100 | at_least | % | compliance register | per quarter |
| ORG-04 | purchases_approved_before_commitment | 100 | at_least | % | procurement log | per purchase |
| PDL-01 | initiatives_with_problem_evidence | 100 | at_least | % | discovery record | per initiative |
| PDL-02 | requirements_with_acceptance_criteria | 100 | at_least | % | requirements register | per release |
| PDL-03 | significant_decisions_with_alternatives | 100 | at_least | % | decision record | per significant decision |
| PDL-04 | delivery_plans_with_dependency_owners | 100 | at_least | % | delivery plan | per release |
| PDL-05 | releases_with_acceptance_record | 100 | at_least | % | release record | per release |
| PPL-01 | access_removed_by_end_date | 100 | at_least | % | identity and access records | per leaver |
| PPL-02 | mandatory_training_completion | 100 | at_least | % | learning management system | per quarter |
| PPL-03 | safety_incidents_closed_on_time | 30 | at_most | days | safety incident log | per incident |
| PPL-04 | work_items_prioritized_at_intake | 100 | at_least | % | work intake board | per month |
| PPL-05 | expenses_approved_before_reimbursement | 100 | at_least | % | expense system | per month |
| PPL-06 | hires_with_recorded_selection_criteria | 100 | at_least | % | recruitment file | per hire |
| PPL-07 | performance_reviews_completed | 100 | at_least | % | HR information system | per year |
| SEC-12 | access_review_before_start_date | 100 | at_least | % | identity and access records | per joiner |
| SEC-13 | asset_inventory_coverage | 100 | at_least | % | asset register | per quarter |
| VEND-01 | vendors_with_documented_limits | 100 | at_least | % | vendor register | per year |
| VEND-02 | vendors_with_exit_plan | 100 | at_least | % | vendor register | per year |
| VEND-03 | services_with_current_unit_economics | 100 | at_least | % | finance review | per quarter |
| VEND-04 | providers_with_current_risk_review | 100 | at_least | % | vendor risk register | per year |
| VEND-05 | provider_failure_drills | 1 | at_least | count | continuity exercise log | per year |
