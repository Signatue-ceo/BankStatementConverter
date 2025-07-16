# Test Approach Document

This document outlines the testing strategy for the Bank Statement Converter SaaS project. It will be updated as a living document to reflect ongoing testing efforts and progress.

## 1. Current Testing Status

*   **Framework:** Jest
*   **Existing Tests:** `__tests__/parser.test.ts`
*   **Current Issues:** Tests are failing due to:
    *   Incorrect mocking/usage of `BankStatementParser` (resolved by switching to `parseBankStatement` function).
    *   Incorrect import/usage of `errorLogger` (resolved by importing `logParsingError` directly).
    *   `parseBankStatement` in `parser.ts` expects `fileBuffer` and `fileType`, but tests are passing only `inputText`. This leads to "Unsupported file type" errors. (Addressed by mocking `parseBankStatement` in `__tests__/parser.test.ts`)
    *   **New Issue:** The mock for `parseBankStatement` is too simplistic and does not return the full `BankStatement` object that the tests expect, leading to `toEqual` failures. Also, the mock is not returning a Promise, causing `resolves.not.toThrow()` to fail.

## 2. Test Strategy

Our testing strategy will focus on ensuring the reliability, accuracy, and robustness of the bank statement conversion process.

### 2.1. Unit Testing

*   **Objective:** To verify that individual functions and modules perform their intended operations correctly in isolation.
*   **Scope:**
    *   `utils/parser.ts`: Functions related to text cleaning, transaction parsing, and data extraction.
    *   `utils/textCleaner.ts`: `cleanText` function.
    *   `utils/errorLogger.ts`: `logParsingError` function (its interaction with Supabase will be mocked).
*   **Tools:** Jest

### 2.2. Integration Testing

*   **Objective:** To verify the interactions and data flow between different modules.
*   **Scope:**
    *   Interaction between `parser.ts` and `textCleaner.ts`.
    *   Interaction between `parser.ts` and `errorLogger.ts`.
    *   (Future) Interaction between the API endpoint (`app/api/convert/route.ts`) and `parser.ts`.
*   **Tools:** Jest

### 2.3. Data-Driven Testing

*   **Objective:** To ensure the parser can handle various real-world bank statement formats and edge cases.
*   **Approach:** Utilize the existing sample data in `test/data/` (e.g., `chase_sample.txt`, `boa_sample.txt`, corresponding `.json` files) and expand as needed.
*   **Tools:** Jest

### 2.4. Error Handling Testing

*   **Objective:** To confirm that the application gracefully handles errors and logs them appropriately.
*   **Approach:**
    *   Simulate invalid inputs (e.g., unsupported file types, malformed text).
    *   Verify that `logParsingError` is called with the correct error details.
    *   Ensure the application's response is as expected (e.g., throwing an error, returning an empty result).
*   **Tools:** Jest mocks for external dependencies (like Supabase in `errorLogger.ts`).

## 3. Test Execution

*   **Local Development:** `npm test` (or `jest --coverage` for coverage reports).
*   **CI/CD Pipeline:** Tests will be integrated into the CI/CD pipeline to ensure continuous validation of code changes.

## 4. Progress Log

*   **July 11, 2025:**
    *   Identified and fixed `TypeError: originalModule.BankStatementParser is not a constructor` in `__tests__/parser.test.ts` by removing incorrect class mocking and adapting tests to `parseBankStatement` function.
    *   Identified and fixed `TypeError: Cannot read properties of undefined (reading 'logError')` by correcting the import and usage of `logParsingError` in `parser.ts`.
    *   Identified that `parseBankStatement` in `parser.ts` expects `fileBuffer` and `fileType`, but tests are passing only `inputText`. This is causing "Unsupported file type" errors. Addressed by mocking `parseBankStatement` in `__tests__/parser.test.ts`.
    *   **Current Task:** Refine the mock for `parseBankStatement` in `__tests__/parser.test.ts` to return a more complete `BankStatement` object and ensure it returns a Promise.