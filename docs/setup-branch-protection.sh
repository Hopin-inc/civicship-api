#!/bin/bash
# Branch protection setup for master and develop
# Usage: bash docs/setup-branch-protection.sh

set -euo pipefail

REPO="Hopin-inc/civicship-api"
PROTECTION_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/branch-protection.json"

for branch in master develop; do
  echo "Setting up protection for ${branch}..."
  gh api -X PUT "/repos/${REPO}/branches/${branch}/protection" \
    -H "Accept: application/vnd.github+json" \
    --input "${PROTECTION_FILE}"
  echo "✓ ${branch} done"
done

echo ""
echo "Verifying..."
for branch in master develop; do
  echo "=== ${branch} ==="
  gh api "/repos/${REPO}/branches/${branch}/protection" \
    --jq '{required_status_checks: .required_status_checks, required_pr_reviews: .required_pull_request_reviews.required_approving_review_count, allow_force_pushes: .allow_force_pushes.enabled, allow_deletions: .allow_deletions.enabled}'
done
