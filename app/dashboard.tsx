import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchKnackRecords, type LogEventData } from '../src/services/knackService';

const APPLE_FONT = Platform.OS === 'ios'
  ? 'System'
  : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

interface SessionData {
  sessionId: string;
  study: 'study1' | 'study2';
  scenario: string;
  autonomyLevel: 'High' | 'Low';
  teaming: boolean;
  startTime: string;
  messagesSent: number;
  aiResponses: number;
  purchases: number;
  blocks: number;
  outcome: 'AUTO_PURCHASED' | 'CONFIRMED' | 'DECLINED' | 'GUARD_BLOCKED' | 'NONE';
  purchaseAmount: number;
  events: LogEventData[];
}

export default function Dashboard() {
  const [records, setRecords] = useState<LogEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchKnackRecords();
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregate events into sessions
  const sessions = useMemo(() => {
    const map: Record<string, SessionData> = {};

    records.forEach((rec) => {
      if (!map[rec.sessionId]) {
        map[rec.sessionId] = {
          sessionId: rec.sessionId,
          study: rec.study,
          scenario: rec.scenario,
          autonomyLevel: rec.autonomyLevel,
          teaming: rec.teaming,
          startTime: rec.timestamp,
          messagesSent: 0,
          aiResponses: 0,
          purchases: 0,
          blocks: 0,
          outcome: 'NONE',
          purchaseAmount: 0,
          events: [],
        };
      }

      const sess = map[rec.sessionId];
      sess.events.push(rec);

      if (rec.eventType === 'MESSAGE_SENT') {
        sess.messagesSent++;
      } else if (rec.eventType === 'MESSAGE_RECEIVED') {
        sess.aiResponses++;
      } else if (rec.eventType === 'DECISION_ACTION') {
        const action = rec.details?.action;
        if (action === 'AUTO_PURCHASED') {
          sess.purchases++;
          sess.outcome = 'AUTO_PURCHASED';
          sess.purchaseAmount += rec.details.price || 0;
        } else if (action === 'CONFIRMED') {
          sess.purchases++;
          sess.outcome = 'CONFIRMED';
          sess.purchaseAmount += rec.details.price || 0;
        } else if (action === 'DECLINED') {
          sess.outcome = 'DECLINED';
        } else if (action === 'GUARD_BLOCKED') {
          sess.blocks++;
          sess.outcome = 'GUARD_BLOCKED';
        }
      }
    });

    return Object.values(map).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [records]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = sessions.length;
    let s1Count = 0;
    let s2Count = 0;
    let purchases = 0;
    let blocks = 0;
    let lowAutoPurchases = 0;
    let highAutoPurchases = 0;
    let lowAutoTotal = 0;
    let highAutoTotal = 0;
    let teamTotal = 0;
    let teamPurchases = 0;
    let noTeamTotal = 0;
    let noTeamPurchases = 0;

    sessions.forEach((s) => {
      if (s.study === 'study1') s1Count++;
      if (s.study === 'study2') s2Count++;
      if (s.purchases > 0) purchases++;
      if (s.blocks > 0) blocks++;

      if (s.autonomyLevel === 'High') {
        highAutoTotal++;
        if (s.outcome === 'AUTO_PURCHASED') highAutoPurchases++;
      } else {
        lowAutoTotal++;
        if (s.outcome === 'CONFIRMED') lowAutoPurchases++;
      }

      if (s.teaming) {
        teamTotal++;
        if (s.outcome === 'AUTO_PURCHASED' || s.outcome === 'CONFIRMED') teamPurchases++;
      } else {
        noTeamTotal++;
        if (s.outcome === 'AUTO_PURCHASED' || s.outcome === 'CONFIRMED') noTeamPurchases++;
      }
    });

    return {
      total,
      s1Count,
      s2Count,
      purchases,
      blocks,
      conversionRate: total > 0 ? (purchases / total) * 100 : 0,
      lowAutoRate: lowAutoTotal > 0 ? (lowAutoPurchases / lowAutoTotal) * 100 : 0,
      highAutoRate: highAutoTotal > 0 ? (highAutoPurchases / highAutoTotal) * 100 : 0,
      teamRate: teamTotal > 0 ? (teamPurchases / teamTotal) * 100 : 0,
      noTeamRate: noTeamTotal > 0 ? (noTeamPurchases / noTeamTotal) * 100 : 0,
    };
  }, [sessions]);

  // Selected Session events
  const selectedSession = useMemo(() => {
    return sessions.find((s) => s.sessionId === selectedSessionId);
  }, [sessions, selectedSessionId]);

  // Export to CSV Functionality
  const exportToCSV = () => {
    if (records.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    // Headers
    csvContent += 'Timestamp,Session ID,Study,Scenario,Autonomy Level,Teaming,Event Type,Action,Product ID,Price,Wallet Balance,Content\r\n';

    records.forEach((rec) => {
      const timestamp = rec.timestamp || '';
      const sid = rec.sessionId || '';
      const study = rec.study || '';
      const scenario = rec.scenario || '';
      const auto = rec.autonomyLevel || '';
      const team = rec.teaming ? 'Yes' : 'No';
      const type = rec.eventType || '';
      const action = rec.details?.action || rec.details?.actionType || '';
      const pid = rec.details?.productId || rec.details?.matchedProductId || '';
      const price = rec.details?.price || rec.details?.matchedPrice || '';
      const wallet = rec.details?.walletBalanceAfter || '';
      
      let text = rec.details?.text || rec.details?.aiMessage || rec.details?.description || '';
      // Clean text for CSV compatibility
      text = text.replace(/"/g, '""').replace(/\n/g, ' ');

      csvContent += `"${timestamp}","${sid}","${study}","${scenario}","${auto}","${team}","${type}","${action}","${pid}","${price}","${wallet}","${text}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `research_data_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <View style={styles.root}>
      {/* Top Navigation */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Research Dashboard</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadData} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#4F46E5" /> : <Ionicons name="refresh" size={18} color="#4F46E5" />}
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={exportToCSV} disabled={records.length === 0}>
            <Ionicons name="download-outline" size={18} color="#FFFFFF" />
            <Text style={styles.exportText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && records.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingLabel}>Fetching records from Knack Database...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="people" size={20} color="#4F46E5" />
              </View>
              <Text style={styles.metricVal}>{stats.total}</Text>
              <Text style={styles.metricLabel}>Total Sessions</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="cart" size={20} color="#10B981" />
              </View>
              <Text style={styles.metricVal}>{stats.purchases}</Text>
              <Text style={styles.metricLabel}>Total Purchases</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#FDF2F8' }]}>
                <Ionicons name="analytics" size={20} color="#DB2777" />
              </View>
              <Text style={styles.metricVal}>{stats.conversionRate.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Conversion Rate</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.metricVal}>{stats.blocks}</Text>
              <Text style={styles.metricLabel}>Safety Blocks</Text>
            </View>
          </View>

          {/* Visual Charts / Comparisons Grid */}
          <View style={styles.chartsGrid}>
            {/* Chart 1: Autonomy Level Impact */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Autonomy Impact on Purchases</Text>
              <Text style={styles.chartSubtitle}>Conversion Rate (%) by Autonomy Level</Text>
              
              <View style={styles.chartBody}>
                {/* Low Autonomy Bar */}
                <View style={styles.chartRow}>
                  <Text style={styles.barLabel}>Low Autonomy</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { width: `${stats.lowAutoRate}%`, backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.barVal}>{stats.lowAutoRate.toFixed(1)}%</Text>
                  </View>
                </View>

                {/* High Autonomy Bar */}
                <View style={styles.chartRow}>
                  <Text style={styles.barLabel}>High Autonomy</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { width: `${stats.highAutoRate}%`, backgroundColor: '#10B981' }]} />
                    <Text style={styles.barVal}>{stats.highAutoRate.toFixed(1)}%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Chart 2: Teaming Impact */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Teaming Impact on Engagement</Text>
              <Text style={styles.chartSubtitle}>Conversion Rate (%) with vs without Ngoc Linh</Text>

              <View style={styles.chartBody}>
                {/* Solo AI Bar */}
                <View style={styles.chartRow}>
                  <Text style={styles.barLabel}>Solo AI</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { width: `${stats.noTeamRate}%`, backgroundColor: '#6366F1' }]} />
                    <Text style={styles.barVal}>{stats.noTeamRate.toFixed(1)}%</Text>
                  </View>
                </View>

                {/* Human-AI Teaming Bar */}
                <View style={styles.chartRow}>
                  <Text style={styles.barLabel}>Collaborative</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { width: `${stats.teamRate}%`, backgroundColor: '#EC4899' }]} />
                    <Text style={styles.barVal}>{stats.teamRate.toFixed(1)}%</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Main Content Layout (Table + Chat logs) */}
          <View style={styles.dashboardLayout}>
            {/* Left Column: Sessions List */}
            <View style={styles.sessionsColumn}>
              <Text style={styles.sectionTitle}>Respondent Sessions ({sessions.length})</Text>
              
              <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.thText, { flex: 2 }]}>Session ID</Text>
                  <Text style={[styles.thText, { flex: 1 }]}>Study</Text>
                  <Text style={[styles.thText, { flex: 1.5 }]}>Autonomy</Text>
                  <Text style={[styles.thText, { flex: 1.5 }]}>Outcome</Text>
                  <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>Price</Text>
                </View>

                {sessions.length === 0 ? (
                  <View style={styles.emptyTable}>
                    <Text style={styles.emptyText}>No sessions tracked yet.</Text>
                  </View>
                ) : (
                  <FlatList
                    data={sessions}
                    keyExtractor={(item) => item.sessionId}
                    renderItem={({ item }) => {
                      const isSelected = item.sessionId === selectedSessionId;
                      let outcomeColor = '#64748B';
                      if (item.outcome === 'CONFIRMED' || item.outcome === 'AUTO_PURCHASED') outcomeColor = '#10B981';
                      if (item.outcome === 'DECLINED') outcomeColor = '#EF4444';
                      if (item.outcome === 'GUARD_BLOCKED') outcomeColor = '#EA580C';

                      return (
                        <TouchableOpacity
                          style={[styles.tableRow, isSelected && styles.selectedTableRow]}
                          onPress={() => setSelectedSessionId(item.sessionId)}
                        >
                          <Text style={[styles.tdText, styles.bold, { flex: 2 }]} numberOfLines={1}>
                            {item.sessionId.replace('sess_', '')}
                          </Text>
                          <Text style={[styles.tdText, { flex: 1 }]}>
                            {item.study === 'study1' ? 'S1' : 'S2'}
                          </Text>
                          <View style={[{ flex: 1.5 }]}>
                            <View style={[styles.statusBadge, { backgroundColor: item.autonomyLevel === 'High' ? '#ECFDF5' : '#EFF6FF' }]}>
                              <Text style={[styles.statusText, { color: item.autonomyLevel === 'High' ? '#10B981' : '#2563EB' }]}>
                                {item.autonomyLevel}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.tdText, { flex: 1.5, color: outcomeColor, fontWeight: '700' }]}>
                            {item.outcome}
                          </Text>
                          <Text style={[styles.tdText, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>
                            ${item.purchaseAmount.toFixed(0)}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </View>
            </View>

            {/* Right Column: Interaction Logs */}
            <View style={styles.logsColumn}>
              <Text style={styles.sectionTitle}>Interaction Chronology</Text>
              
              {selectedSession ? (
                <View style={styles.logsCard}>
                  <View style={styles.logsHeader}>
                    <View style={styles.metaRow}>
                      <Ionicons name="key" size={14} color="#64748B" />
                      <Text style={styles.metaText}>Session: {selectedSession.sessionId}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="git-branch" size={14} color="#64748B" />
                      <Text style={styles.metaText}>Scenario: {selectedSession.scenario} ({selectedSession.autonomyLevel} Autonomy)</Text>
                    </View>
                  </View>

                  <ScrollView style={styles.logsBody} showsVerticalScrollIndicator={true}>
                    {selectedSession.events.map((ev, idx) => {
                      let iconName: any = 'information-circle';
                      let iconColor = '#64748B';
                      let label = '';
                      let content = '';

                      if (ev.eventType === 'ASSIGNED') {
                        iconName = 'checkmark-done-circle';
                        iconColor = '#10B981';
                        label = 'ASSIGNED SCENARIO';
                        content = ev.details.description || '';
                      } else if (ev.eventType === 'MESSAGE_SENT') {
                        iconName = 'person-circle-outline';
                        iconColor = '#4F46E5';
                        label = 'USER SENT';
                        content = `"${ev.details.text}"`;
                      } else if (ev.eventType === 'MESSAGE_RECEIVED') {
                        iconName = 'chatbubble-ellipses-outline';
                        iconColor = '#8B5CF6';
                        label = 'AI RECOMMENDATION';
                        content = ev.details.aiMessage || '';
                      } else if (ev.eventType === 'DECISION_ACTION') {
                        iconName = 'cart-outline';
                        iconColor = ev.details.action === 'DECLINED' ? '#EF4444' : '#10B981';
                        label = `ACTION: ${ev.details.action}`;
                        content = `Product ID: ${ev.details.productId} | Price: $${ev.details.price} | Wallet: $${ev.details.walletBalanceAfter}`;
                      }

                      return (
                        <View key={idx} style={styles.logItem}>
                          <View style={styles.logIndicator}>
                            <Ionicons name={iconName} size={18} color={iconColor} />
                            <View style={styles.logLine} />
                          </View>
                          <View style={styles.logContent}>
                            <Text style={[styles.logLabel, { color: iconColor }]}>{label}</Text>
                            <Text style={styles.logText}>{content}</Text>
                            <Text style={styles.logTime}>{new Date(ev.timestamp).toLocaleTimeString()}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.noSessionCard}>
                  <Ionicons name="chatbubbles-outline" size={48} color="#94A3B8" />
                  <Text style={styles.noSessionText}>Select a session from the table to view the detailed interaction log.</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', fontFamily: APPLE_FONT },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    backgroundColor: '#FFFFFF',
  },
  refreshText: { fontSize: 13, fontWeight: '700', color: '#4F46E5', fontFamily: APPLE_FONT },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
  },
  exportText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', fontFamily: APPLE_FONT },
  
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingLabel: { fontSize: 14, color: '#64748B', fontWeight: '600', fontFamily: APPLE_FONT },

  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 20, gap: 20 },

  metricsGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metricCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    gap: 8,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricVal: { fontSize: 28, fontWeight: '900', color: '#0F172A', fontFamily: APPLE_FONT, letterSpacing: -0.5 },
  metricLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', fontFamily: APPLE_FONT },

  chartsGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  chartCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    gap: 8,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  chartTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: APPLE_FONT },
  chartSubtitle: { fontSize: 11, fontWeight: '500', color: '#94A3B8', fontFamily: APPLE_FONT },
  chartBody: { gap: 14, paddingTop: 8 },
  chartRow: { gap: 6 },
  barLabel: { fontSize: 11, fontWeight: '700', color: '#475569', fontFamily: APPLE_FONT },
  barContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  barFill: { height: 12, borderRadius: 6 },
  barVal: { fontSize: 11, fontWeight: '800', color: '#0F172A', fontFamily: APPLE_FONT, minWidth: 36 },

  dashboardLayout: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', width: '100%' },
  sessionsColumn: { flex: 3, minWidth: 400, gap: 12 },
  logsColumn: { flex: 2.2, minWidth: 300, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: APPLE_FONT },

  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  thText: { fontSize: 11, fontWeight: '800', color: '#64748B', fontFamily: APPLE_FONT, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  selectedTableRow: { backgroundColor: '#EEF2FF' },
  tdText: { fontSize: 13, color: '#334155', fontFamily: APPLE_FONT, fontWeight: '500' },
  bold: { fontWeight: '700', color: '#0F172A' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, fontWeight: '800', fontFamily: APPLE_FONT, textTransform: 'uppercase' },
  emptyTable: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#94A3B8', fontWeight: '500', fontFamily: APPLE_FONT },

  logsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 16,
    minHeight: 400,
  },
  logsHeader: {
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    gap: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontWeight: '700', color: '#475569', fontFamily: APPLE_FONT },
  logsBody: { maxHeight: 420 },
  logItem: { flexDirection: 'row', gap: 12 },
  logIndicator: { alignItems: 'center', width: 20 },
  logLine: { width: 1, backgroundColor: '#E2E8F0', flex: 1, marginVertical: 4 },
  logContent: { flex: 1, paddingBottom: 16, gap: 4 },
  logLabel: { fontSize: 10, fontWeight: '800', fontFamily: APPLE_FONT, letterSpacing: 0.5 },
  logText: { fontSize: 13, color: '#334155', fontFamily: APPLE_FONT, fontWeight: '600', lineHeight: 18 },
  logTime: { fontSize: 10, color: '#94A3B8', fontWeight: '500', fontFamily: APPLE_FONT },

  noSessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
    minHeight: 400,
  },
  noSessionText: { fontSize: 13, color: '#64748B', fontWeight: '500', fontFamily: APPLE_FONT, textAlign: 'center', lineHeight: 20 },
});
