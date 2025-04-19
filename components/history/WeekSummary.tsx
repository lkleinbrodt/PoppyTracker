import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FeedingEntry } from '@/utils/storage';
import Colors from '@/constants/Colors';
import Theme from '@/constants/Theme';
import Card from '@/components/ui/Card';

type WeekSummaryProps = {
  entries: FeedingEntry[];
};

const WeekSummary: React.FC<WeekSummaryProps> = ({ entries }) => {
  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!entries.length) {
      return {
        avgAmount: 0,
        daysOnTarget: 0,
        totalEntries: 0,
        avgPercentage: 0,
      };
    }

    let totalAmount = 0;
    let daysOnTarget = 0;
    
    entries.forEach(entry => {
      totalAmount += entry.amountFed;
      
      if (entry.amountFed >= entry.target) {
        daysOnTarget++;
      }
    });
    
    return {
      avgAmount: totalAmount / entries.length,
      daysOnTarget,
      totalEntries: entries.length,
      avgPercentage: (daysOnTarget / entries.length) * 100,
    };
  }, [entries]);
  
  if (!entries.length) {
    return null;
  }
  
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Weekly Summary</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.avgAmount.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Avg. Cups</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.daysOnTarget}</Text>
          <Text style={styles.statLabel}>Days On Target</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.round(stats.avgPercentage)}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>
      
      <Text style={styles.note}>
        Based on the last {stats.totalEntries} days
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  title: {
    ...Theme.text.title,
    marginBottom: Theme.spacing.md,
    color: Colors.primary.dark,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Theme.text.title,
    color: Colors.accent.dark,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.text.caption,
    color: Colors.text.secondary,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.primary.light,
    opacity: 0.3,
  },
  note: {
    ...Theme.text.caption,
    textAlign: 'center',
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});

export default WeekSummary;