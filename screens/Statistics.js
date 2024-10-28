import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import * as d3 from 'd3-scale-chromatic'; // d3-scale-chromatic 임포트

const Statistics = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [ordersList, setOrdersList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sortOption, setSortOption] = useState('salesCount');
  const [chartData, setChartData] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  const getFormattedDate = (date) => {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const fetchOrders = async (date) => {
    const dateString = getFormattedDate(date);
    try {
      const ordersSnapshot = await getDocs(
        collection(firestore, 'orders', dateString, 'orders')
      );
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrdersList(ordersData);
      calculateTotalSales(ordersData);
    } catch (error) {
      console.error('주문 정보를 가져오는 중 오류 발생:', error);
      Alert.alert('오류', '주문 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const calculateTotalSales = (ordersData) => {
    const total = ordersData.reduce(
      (sum, order) => sum + (parseFloat(order.total) || 0),
      0
    );
    setTotalSales(total);
  };

  useEffect(() => {
    fetchOrders(selectedDate);
  }, []);

  useEffect(() => {
    setChartData(getSortedData());
  }, [sortOption, ordersList]);

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      fetchOrders(date);
    }
  };

  const getMenuSalesData = () => {
    const salesData = {};
    ordersList.forEach((order) => {
      order.menuList.forEach((menu) => {
        const menuName = menu.menuName;
        const menuTotal = parseFloat(menu.price) * parseInt(menu.quantity, 10);
        const menuCount = parseInt(menu.quantity, 10);

        if (salesData[menuName]) {
          salesData[menuName].total += menuTotal;
          salesData[menuName].count += menuCount;
        } else {
          salesData[menuName] = {
            total: menuTotal,
            count: menuCount,
          };
        }
      });
    });

    return Object.entries(salesData).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
    }));
  };

  const getSortedData = () => {
    const menuData = getMenuSalesData();
    return menuData
      .sort((a, b) =>
        sortOption === 'salesCount' ? b.count - a.count : b.total - a.total
      )
      .slice(0, 6);
  };

  const handleSortChange = (itemValue) => {
    setSortOption(itemValue);
  };

  useEffect(() => {
    const sortedData = getSortedData();
    const updatedChartData = sortedData.map((item, index) => ({
      name: item.name,
      population: sortOption === 'salesCount' ? item.count : item.total,
      color: d3.schemeCategory10[index % 10], // d3의 색상 팔레트 사용
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
      label: `${item.name}: ${sortOption === 'salesCount' ? item.count : item.total.toLocaleString()} 원`, // 레이블 형식 변경
    }));

    setChartData(updatedChartData);
  }, [sortOption, ordersList]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={() => setShowDatePicker(true)} style={styles.dateText}>
          선택된 날짜:{' '}
          {`${selectedDate.getFullYear()}년 ${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}월 ${selectedDate.getDate().toString().padStart(2, '0')}일`}
        </Text>
        <Icon
          name="calendar-outline"
          size={20}
          color="#555"
          style={styles.icon}
        />
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      <Text style={styles.totalSales}>
        총 매출: {totalSales.toLocaleString()} 원
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={sortOption}
          onValueChange={handleSortChange}
          style={styles.picker}
        >
          <Picker.Item label="정렬: 매출 건" value="salesCount" />
          <Picker.Item label="정렬: 매출액" value="salesValue" />
        </Picker>
      </View>

      <PieChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: () => '#000',
          style: {
            marginVertical: 8,
            borderRadius: 16,
          },
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 0]}
        absolute
      />

      <FlatList
        data={getSortedData()}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text>
              {item.name}: {item.count}건 / {item.total.toLocaleString()} 원
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  header: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    flex: 1,
  },
  totalSales: {
    fontSize: 20,
    marginBottom: 10,
  },
  icon: {
    marginLeft: 10,
    alignSelf: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  orderItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Statistics;
