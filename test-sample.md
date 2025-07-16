# Sample Bank Statement Test Data

This file contains sample bank statement text that can be used to test the parsing functionality.

## Sample Chase Bank Statement

```
CHASE BANK
Account Statement
Account Number: ****1234
Statement Period: 01/01/2024 to 01/31/2024

Opening Balance: $5,000.00
Closing Balance: $4,850.00

Date        Description                    Amount      Balance
01/02/2024  GROCERY STORE PURCHASE        -$45.67     $4,954.33
01/05/2024  GAS STATION                    -$35.00     $4,919.33
01/08/2024  SALARY DEPOSIT                +$2,500.00  $7,419.33
01/12/2024  RESTAURANT DINNER             -$85.50     $7,333.83
01/15/2024  ONLINE SHOPPING               -$120.00    $7,213.83
01/18/2024  UTILITY BILL PAYMENT          -$150.00    $7,063.83
01/22/2024  ATM WITHDRAWAL                -$200.00    $6,863.83
01/25/2024  PHARMACY                      -$25.30     $6,838.53
01/28/2024  MOVIE TICKETS                 -$45.00     $6,793.53
01/30/2024  COFFEE SHOP                   -$12.50     $6,781.03
01/31/2024  BANK FEE                      -$15.00     $6,766.03
```

## Sample Bank of America Statement

```
BANK OF AMERICA
Monthly Statement
Account: ****5678
Period: 02/01/2024 - 02/29/2024

Beginning Balance: $3,250.00
Ending Balance: $3,125.50

02/01/2024  Beginning Balance              $3,250.00
02/03/2024  CHECK DEPOSIT                 +$500.00   $3,750.00
02/05/2024  WALMART PURCHASE              -$125.75   $3,624.25
02/08/2024  DIRECT DEPOSIT                +$1,800.00 $5,424.25
02/10/2024  RESTAURANT                    -$65.00    $5,359.25
02/12/2024  GAS STATION                   -$40.00    $5,319.25
02/15/2024  ONLINE SUBSCRIPTION           -$29.99    $5,289.26
02/18/2024  GROCERY STORE                 -$85.50    $5,203.76
02/20/2024  PHARMACY                      -$35.00    $5,168.76
02/22/2024  MOVIE THEATER                 -$55.00    $5,113.76
02/25/2024  COFFEE SHOP                   -$8.50     $5,105.26
02/28/2024  BANK FEE                      -$12.00    $5,093.26
```

## Expected Parsing Results

The parser should extract:
- Bank name: "CHASE BANK" or "BANK OF AMERICA"
- Account number: "****1234" or "****5678"
- Statement period: Start and end dates
- Opening/beginning balance
- Closing/ending balance
- All transactions with:
  - Date
  - Description
  - Amount (positive for credits, negative for debits)
  - Balance after transaction
  - Transaction type (credit/debit)

## Testing Instructions

1. Create a PDF with this text content
2. Upload to the application
3. Verify that all transactions are correctly parsed
4. Check export formats (JSON, CSV, Excel)
5. Validate data accuracy and formatting 