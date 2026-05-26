const KNACK_APP_ID = '6a156ad4e0634c315206694e';
const KNACK_API_KEY = '6c8cc45b-54e7-48de-b374-48225f571a3b';
const KNACK_OBJECT_ID = 'object_3'; // Table 1
const KNACK_FIELD_ID = 'field_23'; // Name (Short text)

export interface LogEventData {
  sessionId: string;
  study: 'study1' | 'study2';
  scenario: string;
  autonomyLevel: 'High' | 'Low';
  teaming: boolean;
  timestamp: string;
  eventType: 'ASSIGNED' | 'MESSAGE_SENT' | 'MESSAGE_RECEIVED' | 'DECISION_ACTION';
  details: {
    // ASSIGNED
    studyType?: 'study1' | 'study2';
    description?: string;
    
    // MESSAGE_SENT
    text?: string;
    charCount?: number;
    wordCount?: number;

    // MESSAGE_RECEIVED
    aiMessage?: string;
    matchedProductId?: string;
    matchedPrice?: number;
    actionType?: 'recommend_only' | 'auto_purchase';

    // DECISION_ACTION
    action?: 'CONFIRMED' | 'DECLINED' | 'AUTO_PURCHASED' | 'GUARD_BLOCKED';
    productId?: string;
    price?: number;
    walletBalanceAfter?: number;
  };
}

export async function logToKnack(eventData: LogEventData): Promise<void> {
  try {
    const payload = {
      [KNACK_FIELD_ID]: JSON.stringify(eventData),
    };

    const response = await fetch(`https://api.knack.com/v1/objects/${KNACK_OBJECT_ID}/records`, {
      method: 'POST',
      headers: {
        'X-Knack-Application-Id': KNACK_APP_ID,
        'X-Knack-REST-API-Key': KNACK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('Failed to log to Knack', await response.text());
    }
  } catch (error) {
    console.error('Error logging to Knack:', error);
  }
}

export async function fetchKnackRecords(): Promise<LogEventData[]> {
  try {
    const response = await fetch(`https://api.knack.com/v1/objects/${KNACK_OBJECT_ID}/records?rows_per_page=1000`, {
      method: 'GET',
      headers: {
        'X-Knack-Application-Id': KNACK_APP_ID,
        'X-Knack-REST-API-Key': KNACK_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Knack fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    const records: any[] = data.records || [];

    // Parse the JSON payload inside field_23
    const parsedRecords: LogEventData[] = [];
    for (const rec of records) {
      try {
        const rawJson = rec[KNACK_FIELD_ID];
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (parsed && parsed.sessionId) {
            parsedRecords.push(parsed);
          }
        }
      } catch (e) {
        // Skip unparseable records
      }
    }

    // Sort chronologically
    return parsedRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching Knack records:', error);
    return [];
  }
}
