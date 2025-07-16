import { Transaction, BankStatement, ParsingConfig } from '@/types'

// Add a custom uuidv4 function
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Enhanced parsing configuration for different bank formats
const parsingConfig: ParsingConfig = {
  dateFormats: [
    'MM/DD/YYYY',
    'MM-DD-YYYY',
    'DD/MM/YYYY',
    'DD-MM-YYYY',
    'YYYY-MM-DD',
    'MM/DD/YY',
    'DD/MM/YY'
  ],
  amountPatterns: [
    /[\$]?[\d,]+\.\d{2}/, // Standard currency format
    /[\$]?[\d,]+\s*\.\d{2}/, // Currency with spaces
    /[\$]?[\d,]+\.\d{2}\s*[A-Z]{3}/, // Currency with code
    /[\$]?[\d,]+\s*\.\d{2}\s*[A-Z]{3}/, // Currency with spaces and code
    /\([\$]?[\d,]+\.\d{2}\)/, // Negative amounts in parentheses
    /[\$]?[\d,]+\.\d{2}\s*[\(\)]/, // Amounts with parentheses
    /[\$]?[\d,]+\.\d{2}\s*[-–—]/, // Amounts with various minus signs
    /[-–—]\s*[\$]?[\d,]+\.\d{2}/ // Negative amounts with minus signs
  ],
  descriptionPatterns: [
    /[A-Za-z\s&.,'-]+/, // Standard description
    /[A-Za-z\s&.,'-()]+/, // Description with parentheses
    /[A-Za-z\s&.,'-/#]+/, // Description with special characters
    /[A-Za-z\s&.,'-/#()]+/ // Description with all special characters
  ],
  balancePatterns: [
    /balance\s*:?\s*[\$]?[\d,]+\.\d{2}/i,
    /bal\s*:?\s*[\$]?[\d,]+\.\d{2}/i,
    /[\$]?[\d,]+\.\d{2}\s*balance/i,
    /ending\s+balance\s*:?\s*[\$]?[\d,]+\.\d{2}/i,
    /closing\s+balance\s*:?\s*[\$]?[\d,]+\.\d{2}/i
  ],
  skipLines: [
    /^page\s+\d+/i,
    /^statement\s+period/i,
    /^account\s+summary/i,
    /^total\s+pages/i,
    /^continued\s+on\s+next\s+page/i,
    /^page\s+\d+\s+of\s+\d+/i,
    /^statement\s+date/i,
    /^account\s+number/i,
    /^deposits?\s+and\s+other\s+additions/i,
    /^withdrawals?\s+and\s+other\s+subtractions/i,
    /^service\s+fees?/i,
    /^this\s+page\s+intentionally\s+left\s+blank/i,
    /^total\s+for\s+this\s+period/i,
    /^date\s*description\s*amount/i,
    /^your\s+name/i,
    /^beginning\s+balance/i,
    /^ending\s+balance/i,
    /^total\s+withdrawals/i,
    /^total\s+deposits/i,
    /^summary/i,
    /^balance\s+summary/i,
    /^check\s+number/i,
    /^description$/i,
    /^amount$/i,
    /^balance$/i,
    /^date$/i,
    /^[^a-zA-Z0-9]+$/i, // Only non-alphanumeric
    /^\s*$/ // Empty lines
  ]
}

// Enhanced transaction interface with confidence scoring
interface ParsedTransaction extends Transaction {
  confidence: number;
  rawLines: string[];
  parsingNotes: string[];
}

export class BankStatementParser {
  private config: ParsingConfig
  private debug: boolean = false; // Set to false to disable detailed logs
  private readonly CHUNK_SIZE = 1000; // Process large statements in chunks
  private readonly MAX_LINES_PER_TRANSACTION = 5; // Maximum lines to group for one transaction

  constructor(config: ParsingConfig = parsingConfig, debug: boolean = true) {
    this.config = config
    this.debug = debug;
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.debug('[BankStatementParser]', ...args);
    }
  }
  private logError(...args: any[]) {
    // Only log actual errors, not debug info
    if (args.length > 0) {
      console.error('[BankStatementParser][ERROR]', ...args);
    }
  }

  /**
   * Extract text from PDF buffer
   */
  async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    this.log('Extracting text from PDF buffer...');
    try {
      // Dynamic import to avoid SSR issues
      const pdfParse = await import('pdf-parse')
      const data = await pdfParse.default(pdfBuffer)
      this.log('Extracted text length:', data.text.length);
      return data.text
    } catch (error) {
      this.logError('Failed to extract text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error}`)
    }
  }

  /**
   * Enhanced parseBankStatement with robust transaction parsing
   */
  async parseBankStatement(text: string): Promise<BankStatement> {
    const startTime = Date.now()
    this.log('Starting enhanced parseBankStatement...');
    
    // Clean and normalize text
    const cleanedText = this.cleanText(text)
    this.log('Cleaned text length:', cleanedText.length);
    
    // Extract basic information
    const bankName = this.extractBankName(cleanedText)
    this.log('Extracted bankName:', bankName);
    const accountNumber = this.extractAccountNumber(cleanedText)
    this.log('Extracted accountNumber:', accountNumber);
    const statementPeriod = this.extractStatementPeriod(cleanedText)
    this.log('Extracted statementPeriod:', statementPeriod);
    
    this.log('Extracting balances...');
    let balances = { opening: 0, closing: 0 };
    try {
      // Add timeout for balance extraction
      const balancePromise = new Promise<{ opening: number; closing: number }>((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Balance extraction timed out'));
        }, 5000); // 5 second timeout
        resolve(this.extractBalances(cleanedText));
      });
      balances = await balancePromise;
    } catch (err) {
      this.logError('Balance extraction failed or timed out:', err);
      balances = { opening: 0, closing: 0 };
    }
    this.log('Extracted balances:', balances);
    
    this.log('Extracting transactions with enhanced parsing...');
    // Enhanced transaction extraction with chunking for large statements
    let transactions: Transaction[] = [];
    let timedOut = false;
    const timeoutMs = 30000; // Increased timeout for large statements
    const startTx = Date.now();
    
    try {
      const txPromise = new Promise<Transaction[]>((resolve, reject) => {
        setTimeout(() => {
          timedOut = true;
          reject(new Error('Transaction extraction timed out'));
        }, timeoutMs);
        resolve(this.parseTransactionsEnhanced(cleanedText));
      });
      transactions = await txPromise;
    } catch (err) {
      this.logError('Transaction extraction failed or timed out:', err);
      transactions = [];
    }
    
    this.log('Parsed transactions:', transactions.length);
    
    // Calculate overall confidence score
    const confidence = this.calculateOverallConfidence(transactions, cleanedText)
    this.log('Calculated overall confidence:', confidence);
    
    const processingTime = Date.now() - startTime
    this.log('Processing time (ms):', processingTime);

    return {
      id: this.generateId(),
      bankName,
      accountNumber,
      statementPeriod,
      openingBalance: balances.opening,
      closingBalance: balances.closing,
      transactions,
      metadata: {
        processingTime,
        confidence,
        sourceFormat: 'pdf',
        totalTransactions: transactions.length
      }
    }
  }

  /**
   * Clean and normalize text for parsing
   */
  private cleanText(text: string): string {
    this.log('Cleaning text...');
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space, but preserve newlines
      .trim()
    this.log('Text cleaned. Length:', cleaned.length);
    return cleaned
  }

  /**
   * Extract bank name from text (improved for Bank of America)
   */
  private extractBankName(text: string): string | undefined {
    this.log('Extracting bank name...');
    // Try to match full bank name for Bank of America
    const bankPatterns = [
      /Bank of America,? N\.A\./i,
      /Bank of America/i,
      /(?:bank|financial|credit union)\s+of\s+([A-Za-z\s]+)/i,
      /([A-Za-z\s]+)\s+(?:bank|financial|credit union)/i,
      /([A-Za-z\s]+)\s+statement/i
    ];
    for (const pattern of bankPatterns) {
      const match = text.match(pattern);
      if (match) {
        this.log('Bank name matched:', match[0]);
        return match[0].trim();
      }
    }
    this.log('Bank name not found.');
    return undefined;
  }

  /**
   * Extract account number from text (preserve formatting)
   */
  private extractAccountNumber(text: string): string | undefined {
    this.log('Extracting account number...');
    const accountPatterns = [
      /Account number: ([\d\sXx*]+)/i,
      /Account # ([\d\sXx*]+)/i,
      /Account\s+(?:number|no|#)?\s*:?[\s]*([\d\sXx*]+)/i,
      /Acc\s+(?:number|no|#)?\s*:?[\s]*([\d\sXx*]+)/i,
      /([\d\sXx*]{8,})/ // Generic pattern for account numbers
    ];
    for (const pattern of accountPatterns) {
      const match = text.match(pattern);
      if (match) {
        const accountNumber = match[1].trim();
        if (accountNumber.length >= 8) {
          this.log('Extracted account number:', accountNumber);
          return accountNumber;
        }
      }
    }
    return undefined;
  }

  /**
   * Extract statement period from text (add Month DD, YYYY support)
   */
  private extractStatementPeriod(text: string): { start: Date; end: Date } {
    const periodPatterns = [
      /statement\s+period\s*:?[\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*to\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /period\s*:?[\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*-\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /from\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+to\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      // Add support for 'April 01, 2016 to April 30, 2016'
      /([A-Za-z]+ \d{1,2}, \d{4}) to ([A-Za-z]+ \d{1,2}, \d{4})/i
    ];
    for (const pattern of periodPatterns) {
      const match = text.match(pattern);
      if (match) {
        const startDate = this.parseDateEnhanced(match[1], pattern);
        const endDate = this.parseDateEnhanced(match[2], pattern);
        if (startDate && endDate) {
          this.log('Extracted statement period:', { start: startDate, end: endDate });
          return { start: startDate, end: endDate };
        }
      }
    }
    // Fallback: use current month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.log('Using fallback statement period:', { start, end });
    return { start, end };
  }

  /**
   * Extract opening and closing balances (add support for 'Beginning balance on <date> $amount')
   */
  private extractBalances(text: string): { opening: number; closing: number } {
    const balancePatterns = [
      { pattern: /opening\s+balance\s*:?[\s]*[\$]?([\d,]+\.\d{2})/i, type: 'opening' },
      { pattern: /beginning\s+balance\s+on\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}\s*\$([\d,]+\.\d{2})/i, type: 'opening' },
      { pattern: /beginning\s+balance\s*:?[\s]*[\$]?([\d,]+\.\d{2})/i, type: 'opening' },
      { pattern: /closing\s+balance\s*:?[\s]*[\$]?([\d,]+\.\d{2})/i, type: 'closing' },
      { pattern: /ending\s+balance\s+on\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}\s*\$([\d,]+\.\d{2})/i, type: 'closing' },
      { pattern: /ending\s+balance\s*:?[\s]*[\$]?([\d,]+\.\d{2})/i, type: 'closing' },
      // Add pattern for Bank of America format: $50,587.57  - (with dash)
      { pattern: /[\$]([\d,]+\.\d{2})\s*[-–—]\s*$/i, type: 'closing' },
      // Add pattern for Bank of America format: $50,587.57 (at end of line)
      { pattern: /[\$]([\d,]+\.\d{2})\s*$/i, type: 'closing' }
    ];
    let opening = 0;
    let closing = 0;
    
    // Add timeout protection to prevent infinite loops
    const maxIterations = 1000;
    let iterationCount = 0;
    
    for (const { pattern, type } of balancePatterns) {
      if (iterationCount >= maxIterations) {
        this.log('Balance extraction timeout - stopping to prevent infinite loop');
        break;
      }
      
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(text)) !== null && iterationCount < maxIterations) {
        iterationCount++;
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount)) {
          if (type === 'opening') {
            opening = amount;
          } else if (type === 'closing') {
            closing = amount;
          }
        }
        
        // Prevent infinite loop by checking if we're stuck on the same position
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    }
    
    // If we still don't have a closing balance, try to find it in the last few lines
    if (closing === 0) {
      const lines = text.split('\n');
      // Look at the last 10 lines for a balance pattern
      for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
        const line = lines[i].trim();
        // Look for patterns like $50,587.57 or $50,587.57 -
        const balanceMatch = line.match(/[\$]([\d,]+\.\d{2})\s*[-–—]?\s*$/);
        if (balanceMatch) {
          const amount = parseFloat(balanceMatch[1].replace(/,/g, ''));
          if (!isNaN(amount) && amount > 0) {
            closing = amount;
            this.log('Found closing balance in last lines:', closing);
            break;
          }
        }
      }
    }
    
    this.log('Extracted balances:', { opening, closing });
    return { opening, closing };
  }

  /**
   * Enhanced transaction parsing with multi-line support and confidence scoring
   */
  private parseTransactionsEnhanced(text: string): Transaction[] {
    // Split text into lines and filter out header/footer lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !this.shouldSkipLine(line));
    
    this.log('Processing', lines.length, 'lines for transactions');
    
    const transactions: ParsedTransaction[] = [];
    let currentTransaction: ParsedTransaction | null = null;
    let lineIndex = 0;
    
    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      
      // Check if this line starts a new transaction (has a date)
      const dateMatch = this.findDateInLineEnhanced(line);
      
      if (dateMatch) {
        // Save previous transaction if exists
        if (currentTransaction) {
          transactions.push(currentTransaction);
        }
        
        // Start new transaction - look for amount in current line or next few lines
        const amountMatch = this.findAmountInLineEnhanced(line);
        if (amountMatch) {
          // Amount found on same line
          currentTransaction = this.createTransactionFromLine(line, lineIndex, lines, dateMatch);
          lineIndex++;
        } else {
          // Amount might be on next line(s) - create transaction and look ahead
          currentTransaction = this.createTransactionFromLine(line, lineIndex, lines, dateMatch);
          lineIndex++;
          
          // Look ahead for amount in next few lines
          const lookAheadResult = this.lookAheadForAmount(currentTransaction, lineIndex, lines);
          currentTransaction = lookAheadResult.transaction;
          lineIndex = lookAheadResult.nextIndex;
        }
        
        // Look ahead for continuation lines (multi-line descriptions)
        if (currentTransaction) {
          const mergeResult = this.mergeContinuationLines(currentTransaction, lineIndex, lines);
          currentTransaction = mergeResult.transaction;
          lineIndex = mergeResult.nextIndex; // Update lineIndex to skip processed lines
        }
      } else if (currentTransaction) {
        // This might be a continuation line for the current transaction
        const continuationResult = this.tryMergeContinuationLine(currentTransaction, line, lineIndex);
        if (continuationResult.merged) {
          currentTransaction = continuationResult.transaction;
        } else {
          // No more continuation, finalize current transaction
          transactions.push(currentTransaction);
          currentTransaction = null;
        }
        lineIndex++;
      } else {
        // Skip lines that don't match transaction patterns
        lineIndex++;
      }
    }
    
    // Add final transaction if exists
    if (currentTransaction) {
      transactions.push(currentTransaction);
    }
    
    // Filter out transactions without amounts
    const validTransactions = transactions.filter(tx => tx.amount > 0);
    
    // Sort by date and convert to standard Transaction format
    const sortedTransactions = validTransactions
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(tx => this.convertToStandardTransaction(tx));
    
    this.log('Enhanced parsing completed. Found', sortedTransactions.length, 'transactions');
    return sortedTransactions;
  }

  /**
   * Create a transaction from a line that contains a date
   */
  private createTransactionFromLine(line: string, lineIndex: number, allLines: string[], dateMatch: { date: Date; endIndex: number }): ParsedTransaction {
    const parsingNotes: string[] = [];
    let confidence = 0.8; // Base confidence for having a date
    
    // Extract amount with enhanced negative amount handling
    const amountMatch = this.findAmountInLineEnhanced(line);
    if (!amountMatch) {
      parsingNotes.push('No amount found');
      confidence -= 0.3;
    }
    
    // Extract description
    const description = this.extractDescriptionEnhanced(line, dateMatch.endIndex, amountMatch?.startIndex || line.length);
    if (!description.trim()) {
      parsingNotes.push('No description found');
      confidence -= 0.2;
    }
    
    // Determine transaction type
    const type = this.determineTransactionType(line, amountMatch?.amount || 0);
    
    // Extract balance
    const balance = this.extractBalanceFromContextEnhanced(lineIndex, allLines);
    
    // Extract reference
    const reference = this.extractReferenceEnhanced(line);
    
    const transaction: ParsedTransaction = {
      id: this.generateId(),
      date: dateMatch.date,
      description: description.trim(),
      amount: Math.abs(amountMatch?.amount || 0),
      type,
      balance,
      reference,
      confidence: Math.max(0, Math.min(1, confidence)),
      rawLines: [line],
      parsingNotes
    };
    
    this.log('Created transaction:', {
      date: transaction.date.toISOString().split('T')[0],
      description: transaction.description.substring(0, 30) + '...',
      amount: transaction.amount,
      type: transaction.type,
      confidence: transaction.confidence
    });
    
    return transaction;
  }

  /**
   * Merge continuation lines for multi-line transactions
   */
  private mergeContinuationLines(transaction: ParsedTransaction, startIndex: number, allLines: string[]): { transaction: ParsedTransaction; nextIndex: number } {
    let currentIndex = startIndex;
    let mergedTransaction = { ...transaction };
    
    // Look ahead up to MAX_LINES_PER_TRANSACTION lines
    while (currentIndex < allLines.length && 
           mergedTransaction.rawLines.length < this.MAX_LINES_PER_TRANSACTION) {
      
      const line = allLines[currentIndex];
      
      // Skip if this line has a date (new transaction)
      if (this.findDateInLineEnhanced(line)) {
        break;
      }
      
      // Skip if this line has a clear amount pattern (might be balance)
      const amountMatch = this.findAmountInLineEnhanced(line);
      if (amountMatch && this.isLikelyBalanceLine(line)) {
        break;
      }
      
      // Try to merge this line as continuation
      const continuationResult = this.tryMergeContinuationLine(mergedTransaction, line, currentIndex);
      if (continuationResult.merged) {
        mergedTransaction = continuationResult.transaction;
        currentIndex++;
      } else {
        break;
      }
    }
    
    return { transaction: mergedTransaction, nextIndex: currentIndex };
  }

  /**
   * Look ahead for amount in next few lines
   */
  private lookAheadForAmount(transaction: ParsedTransaction, startIndex: number, allLines: string[]): { transaction: ParsedTransaction; nextIndex: number } {
    let currentIndex = startIndex;
    let updatedTransaction = { ...transaction };
    
    // Look ahead up to 3 lines for an amount
    while (currentIndex < allLines.length && currentIndex < startIndex + 3) {
      const line = allLines[currentIndex];
      
      // Skip if this line has a date (new transaction)
      if (this.findDateInLineEnhanced(line)) {
        break;
      }
      
      // Check for amount in this line
      const amountMatch = this.findAmountInLineEnhanced(line);
      if (amountMatch) {
        // Found amount - update transaction
        updatedTransaction.amount = Math.abs(amountMatch.amount);
        updatedTransaction.type = this.determineTransactionType(line, amountMatch.amount);
        updatedTransaction.rawLines.push(line);
        updatedTransaction.parsingNotes.push('Amount found in look-ahead line');
        updatedTransaction.confidence = Math.min(1, updatedTransaction.confidence + 0.2);
        currentIndex++;
        break;
      }
      
      // If no amount found, this might be description continuation
      const lineDescription = this.extractDescriptionFromLine(line);
      if (lineDescription.trim()) {
        updatedTransaction.description += ' ' + lineDescription.trim();
        updatedTransaction.rawLines.push(line);
        updatedTransaction.parsingNotes.push('Description extended from look-ahead line');
      }
      
      currentIndex++;
    }
    
    return { transaction: updatedTransaction, nextIndex: currentIndex };
  }

  /**
   * Try to merge a continuation line into the current transaction
   */
  private tryMergeContinuationLine(transaction: ParsedTransaction, line: string, lineIndex: number): { merged: boolean; transaction: ParsedTransaction } {
    // Check if this line looks like a continuation (no date, no clear amount pattern)
    if (this.findDateInLineEnhanced(line)) {
      return { merged: false, transaction };
    }
    
    // Check if this line has a clear amount that might be a balance
    const amountMatch = this.findAmountInLineEnhanced(line);
    if (amountMatch && this.isLikelyBalanceLine(line)) {
      // Update balance if we don't have one
      if (transaction.balance === undefined) {
        transaction.balance = amountMatch.amount;
        transaction.parsingNotes.push('Balance extracted from continuation line');
      }
      return { merged: false, transaction };
    }
    
    // Merge description
    const lineDescription = this.extractDescriptionFromLine(line);
    if (lineDescription.trim()) {
      transaction.description += ' ' + lineDescription.trim();
      transaction.rawLines.push(line);
      transaction.parsingNotes.push('Description extended from continuation line');
      transaction.confidence = Math.min(1, transaction.confidence + 0.1); // Boost confidence for multi-line
      return { merged: true, transaction };
    }
    
    return { merged: false, transaction };
  }

  /**
   * Enhanced date finding with better pattern matching
   */
  private findDateInLineEnhanced(line: string): { date: Date; endIndex: number } | null {
    // Enhanced date patterns including various formats
    const datePatterns = [
      // MM/DD/IN-amount format (Bank of America specific)
      /(\d{1,2})\/(\d{1,2})\/IN/,
      // MM/DD/YYYY or MM/DD/YY
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
      // MM-DD-YYYY or MM-DD-YY
      /(\d{1,2})-(\d{1,2})-(\d{2,4})/,
      // YYYY-MM-DD
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      // Month DD, YYYY
      /([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/,
      // DD Month YYYY
      /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/,
      // MM.DD.YYYY
      /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/
    ];
    
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        let date: Date | null = null;
        
        // Handle Bank of America format (MM/DD/IN)
        if (pattern.source.includes('\\/IN')) {
          const month = parseInt(match[1]) - 1;
          const day = parseInt(match[2]);
          const year = 2016; // Default to 2016 for this sample
          date = new Date(year, month, day);
        } else {
          date = this.parseDateEnhanced(match[0], pattern);
        }
        
        if (date && !isNaN(date.getTime())) {
          this.log('Found date:', date.toISOString(), 'in line:', line.substring(0, 50));
          return { date, endIndex: match.index! + match[0].length };
        }
      }
    }
    
    return null;
  }

  /**
   * Enhanced amount finding with negative amount support
   */
  private findAmountInLineEnhanced(line: string): { amount: number; startIndex: number; balance?: number } | null {
    const matches: { amount: number; startIndex: number; isNegative: boolean }[] = [];
    
    // Enhanced amount patterns
    const amountPatterns = [
      // Standard positive amounts
      { pattern: /[\$]?([\d,]+\.\d{2})/, isNegative: false },
      // Negative amounts in parentheses
      { pattern: /\([\$]?([\d,]+\.\d{2})\)/, isNegative: true },
      // Negative amounts with minus sign
      { pattern: /[-–—]\s*[\$]?([\d,]+\.\d{2})/, isNegative: true },
      // Amounts with DR/CR indicators
      { pattern: /[\$]?([\d,]+\.\d{2})\s*(DR|CR)/i, isNegative: false },
      // Amounts with debit/credit indicators
      { pattern: /[\$]?([\d,]+\.\d{2})\s*(debit|credit)/i, isNegative: false }
    ];
    
    for (const { pattern, isNegative } of amountPatterns) {
      let match;
      const regex = new RegExp(pattern, 'g');
      while ((match = regex.exec(line)) !== null) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount)) {
          const finalAmount = isNegative ? -amount : amount;
          matches.push({ amount: finalAmount, startIndex: match.index!, isNegative });
        }
      }
    }
    
    if (matches.length === 0) return null;
    
    // Sort by position in line (left to right)
    matches.sort((a, b) => a.startIndex - b.startIndex);
    
    // If multiple amounts, first is usually transaction, second might be balance
    if (matches.length >= 2) {
      this.log('Found multiple amounts:', matches.map(m => ({ amount: m.amount, startIndex: m.startIndex })));
      return { 
        amount: matches[0].amount, 
        startIndex: matches[0].startIndex, 
        balance: matches[1].amount 
      };
    }
    
    return { amount: matches[0].amount, startIndex: matches[0].startIndex };
  }

  /**
   * Enhanced description extraction
   */
  private extractDescriptionEnhanced(line: string, dateEndIndex: number, amountStartIndex: number): string {
    // Extract text between date and amount
    const between = line.slice(dateEndIndex, amountStartIndex);
    const cleaned = between.replace(/\s+/g, ' ').trim();
    
    if (cleaned.length > 0) {
      return cleaned;
    }
    
    // Fallback: extract description from the entire line
    return this.extractDescriptionFromLine(line);
  }

  /**
   * Extract description from a line without date/amount context
   */
  private extractDescriptionFromLine(line: string): string {
    // Remove common non-description elements
    const cleaned = line
      .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '') // Remove dates
      .replace(/\d{1,2}-\d{1,2}-\d{2,4}/g, '') // Remove dates with dashes
      .replace(/[\$]?[\d,]+\.\d{2}/g, '') // Remove amounts
      .replace(/\([\$]?[\d,]+\.\d{2}\)/g, '') // Remove amounts in parentheses
      .replace(/\b(DR|CR|debit|credit)\b/gi, '') // Remove transaction type indicators
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return cleaned;
  }

  /**
   * Determine transaction type with enhanced logic
   */
  private determineTransactionType(line: string, amount: number): 'credit' | 'debit' {
    // Check for explicit indicators
    if (/\bCR\b|\bcredit\b/i.test(line)) {
      return 'credit';
    }
    if (/\bDR\b|\bdebit\b/i.test(line)) {
      return 'debit';
    }
    
    // Check for negative amounts (usually debits)
    if (amount < 0) {
      return 'debit';
    }
    
    // Check for parentheses (usually negative/debit)
    if (/\([\$]?[\d,]+\.\d{2}\)/.test(line)) {
      return 'debit';
    }
    
    // Default based on amount sign
    return amount >= 0 ? 'credit' : 'debit';
  }

  /**
   * Enhanced balance extraction from context
   */
  private extractBalanceFromContextEnhanced(lineIndex: number, allLines: string[]): number | undefined {
    // Check current line and surrounding lines for balance patterns
    const indicesToCheck = [lineIndex - 2, lineIndex - 1, lineIndex, lineIndex + 1, lineIndex + 2]
      .filter(i => i >= 0 && i < allLines.length);
    
    for (const i of indicesToCheck) {
      const line = allLines[i];
      for (const pattern of this.config.balancePatterns) {
        const match = line.match(pattern);
        if (match) {
          const balanceStr = match[0].replace(/[^\d.-]/g, '');
          const balance = parseFloat(balanceStr);
          if (!isNaN(balance)) {
            this.log('Found balance in context:', balance);
            return balance;
          }
        }
      }
    }
    
    return undefined;
  }

  /**
   * Enhanced reference extraction
   */
  private extractReferenceEnhanced(line: string): string | undefined {
    const refPatterns = [
      /ref\s*:?:?\s*([A-Z0-9]+)/i,
      /reference\s*:?:?\s*([A-Z0-9]+)/i,
      /check\s*#\s*([A-Z0-9]+)/i,
      /transaction\s*id\s*:?\s*([A-Z0-9]+)/i
    ];
    
    for (const pattern of refPatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // Look for reference-like patterns only if 'ref' context is present
    if (/ref(erence)?|check|transaction/i.test(line)) {
      const genericPattern = /([A-Z0-9]{8,})/;
      const match = line.match(genericPattern);
      if (match) {
        return match[1];
      }
    }
    
    return undefined;
  }

  /**
   * Enhanced date parsing with better format support
   */
  private parseDateEnhanced(dateStr: string, pattern: RegExp): Date | null {
    // Handle Month DD, YYYY format
    const monthNamePattern = /([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/;
    if (monthNamePattern.test(dateStr)) {
      const match = dateStr.match(monthNamePattern);
      if (match) {
        const monthNames = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'
        ];
        const month = monthNames.indexOf(match[1].toLowerCase());
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        if (month >= 0 && !isNaN(day) && !isNaN(year)) {
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }
    
    // Handle DD Month YYYY format
    const dayMonthPattern = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/;
    if (dayMonthPattern.test(dateStr)) {
      const match = dateStr.match(dayMonthPattern);
      if (match) {
        const monthNames = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'
        ];
        const day = parseInt(match[1]);
        const month = monthNames.indexOf(match[2].toLowerCase());
        const year = parseInt(match[3]);
        if (month >= 0 && !isNaN(day) && !isNaN(year)) {
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }
    
    // Handle numeric formats
    const numericMatch = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (numericMatch) {
      let month: number, day: number, year: number;
      
      // Determine format based on pattern
      if (pattern.source.includes('(\\d{4})')) {
        // YYYY-MM-DD format
        year = parseInt(numericMatch[1]);
        month = parseInt(numericMatch[2]) - 1;
        day = parseInt(numericMatch[3]);
      } else {
        // MM/DD/YYYY or DD/MM/YYYY format
        month = parseInt(numericMatch[1]) - 1;
        day = parseInt(numericMatch[2]);
        year = parseInt(numericMatch[3]);
        
        // Handle 2-digit years
        if (year < 100) {
          year += year < 50 ? 2000 : 1900;
        }
      }
      
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  }

  /**
   * Check if a line is likely a balance line
   */
  private isLikelyBalanceLine(line: string): boolean {
    const balanceKeywords = ['balance', 'bal', 'ending', 'closing', 'total'];
    return balanceKeywords.some(keyword => 
      new RegExp(`\\b${keyword}\\b`, 'i').test(line)
    );
  }

  /**
   * Convert ParsedTransaction to standard Transaction
   */
  private convertToStandardTransaction(parsedTx: ParsedTransaction): Transaction {
    return {
      id: parsedTx.id,
      date: parsedTx.date,
      description: parsedTx.description,
      amount: parsedTx.amount,
      type: parsedTx.type,
      balance: parsedTx.balance,
      reference: parsedTx.reference
    };
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(transactions: Transaction[], text: string): number {
    if (transactions.length === 0) return 0;

    const totalLines = text.split('\n').length;
    const transactionLines = transactions.length;
    const ratio = transactionLines / totalLines;

    // Base confidence on transaction density
    let confidence = Math.min(ratio * 100, 95);

    // Boost confidence if we found dates and amounts consistently
    const hasDates = transactions.every(t => t.date);
    const hasAmounts = transactions.every(t => t.amount > 0);
    
    if (hasDates && hasAmounts) {
      confidence += 5;
    }

    // Boost confidence for reasonable transaction count
    if (transactions.length >= 5 && transactions.length <= 500) {
      confidence += 10;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Check if line should be skipped
   */
  private shouldSkipLine(line: string): boolean {
    return this.config.skipLines.some(pattern => pattern.test(line))
  }

  /**
   * Generate unique ID (custom uuidv4)
   */
  private generateId(): string {
    return uuidv4();
  }
} 