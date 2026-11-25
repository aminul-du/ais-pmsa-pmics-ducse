#!/usr/bin/env bash

BOLD='\033[1m'
CYAN='\033[1;36m'
BLUE='\033[1;34m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
DIM='\033[2m'
NC='\033[0m'

print_row() {
    local label="$1"
    local plain_val="$2"
    local color_val="$3"
    local prefix="  $(printf '%-18s' "$label") : "
    local total_visible=$(( ${#prefix} + ${#plain_val} ))
    local pad=$(( 72 - total_visible ))
    [ $pad -lt 1 ] && pad=1
    printf "${CYAN}║${NC}  ${BLUE}%-18s${NC} : %b%*s${CYAN}║${NC}\n" "$label" "$color_val" "$pad" ""
}

# Run checks before clearing screen so output is instant and clean
REPO_URL="$(git remote get-url origin 2>/dev/null || echo 'https://github.com')"
BRANCH_TAG="$(git branch --show-current 2>/dev/null || echo 'main') / v1.0.0"
COMMIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo '1e12300')"

LEAK_FILES=$(grep -rilE '(mcore|BEGIN OPENSSH PRIVATE KEY|ghp_)' . \
  --exclude-dir=.git \
  --exclude='verification-report.txt' \
  --exclude='pmics_status.sh' 2>/dev/null | tr '\n' ' ' | sed 's/ $//')

if [ -n "$LEAK_FILES" ]; then
    PLAIN_1="[ FAIL ] $LEAK_FILES"
    COLOR_1="${RED}[ FAIL ]${NC} ${YELLOW}${LEAK_FILES}${NC}"
else
    PLAIN_1="[ PASS ] Clean Separation"
    COLOR_1="${GREEN}[ PASS ]${NC} Clean Separation"
fi

if grep -q 'GW Charter' docs/research/04-methodology.md 2>/dev/null; then
    PLAIN_2="[ PASS ] Verified in 04-methodology.md"
    COLOR_2="${GREEN}[ PASS ]${NC} Verified in 04-methodology.md"
else
    PLAIN_2="[ MISS ] Tag not found"
    COLOR_2="${RED}[ MISS ]${NC} Tag not found"
fi

if (cd apps/digital-twin && cargo test --quiet >/dev/null 2>&1); then
    PLAIN_3="[ PASS ] Unit Tests OK"
    COLOR_3="${GREEN}[ PASS ]${NC} Unit Tests OK"
else
    PLAIN_3="[ FAIL ] Cargo test error"
    COLOR_3="${RED}[ FAIL ]${NC} Cargo test error"
fi

if [ -f results/BENCHMARK_REPORT.md ]; then
    PLAIN_4="[ READY ] results/BENCHMARK_REPORT.md"
    COLOR_4="${GREEN}[ READY ]${NC} results/BENCHMARK_REPORT.md"
else
    PLAIN_4="[ PENDING ] NOT_RUN"
    COLOR_4="${YELLOW}[ PENDING ]${NC} NOT_RUN"
fi

clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${BOLD}PREDICTIVE MEMORY SECURITY ASSESSMENT (PMSA) - SHORBORNOAI${NC}            ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${DIM}University of Dhaka | PMICS | Dept. of CSE${NC}                            ${CYAN}║${NC}"
echo -e "${CYAN}╠════════════════════════════════════════════════════════════════════════╣${NC}"

print_row "Researchers" "Md. Aminul Islam (70002), Alvee Talukder (70062)" "Md. Aminul Islam (70002), Alvee Talukder (70062)"
print_row "Supervisor" "Prof. Dr. Md. Rezaul Karim (Coordinator, PMICS)" "Prof. Dr. Md. Rezaul Karim (Coordinator, PMICS)"
print_row "Repository" "$REPO_URL" "$REPO_URL"
print_row "Branch / Tag" "$BRANCH_TAG" "${GREEN}${BRANCH_TAG}${NC}"
print_row "Commit SHA" "$COMMIT_SHA" "${YELLOW}${COMMIT_SHA}${NC}"

echo -e "${CYAN}╠════════════════════════════════════════════════════════════════════════╣${NC}"

print_row "[1] Governance" "$PLAIN_1" "$COLOR_1"
print_row "[2] GW Charter" "$PLAIN_2" "$COLOR_2"
print_row "[3] Rust Engine" "$PLAIN_3" "$COLOR_3"
print_row "[4] Benchmarks" "$PLAIN_4" "$COLOR_4"

echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
