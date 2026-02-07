#!/bin/bash

# Coverage check script

set -e

echo "📊 Checking Test Coverage"
echo ""

cd contracts

# Run coverage
forge coverage --report lcov

# Check if lcov is installed for HTML report
if command -v genhtml &> /dev/null; then
    echo ""
    echo "📈 Generating HTML coverage report..."
    genhtml coverage/lcov.info -o coverage/html
    echo "✅ HTML report generated: contracts/coverage/html/index.html"
else
    echo ""
    echo "💡 Install lcov for HTML reports:"
    echo "   Ubuntu/Debian: sudo apt-get install lcov"
    echo "   macOS: brew install lcov"
fi

# Parse coverage from lcov.info
if [ -f "coverage/lcov.info" ]; then
    echo ""
    echo "📋 Coverage Summary:"
    echo "==================="
    
    # Extract coverage percentages
    lines=$(grep "^LF:" coverage/lcov.info | awk '{sum+=$2} END {print sum}')
    hits=$(grep "^LH:" coverage/lcov.info | awk '{sum+=$2} END {print sum}')
    
    if [ ! -z "$lines" ] && [ "$lines" -gt 0 ]; then
        coverage=$(echo "scale=2; $hits * 100 / $lines" | bc)
        echo "Lines: $hits / $lines ($coverage%)"
        
        if (( $(echo "$coverage >= 80" | bc -l) )); then
            echo "✅ Coverage meets requirement (>= 80%)"
        else
            echo "⚠️  Coverage below requirement (>= 80%)"
        fi
    fi
fi

echo ""
echo "✅ Coverage check complete"
