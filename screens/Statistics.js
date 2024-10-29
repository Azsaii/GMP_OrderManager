import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator, // 로딩 인디케이터 컴포넌트
} from 'react-native';
import { firestore } from '../firebaseConfig'; // Firebase Firestore 설정 가져오기
import { collection, getDocs } from 'firebase/firestore'; // Firestore 데이터 가져오기
import DateTimePicker from '@react-native-community/datetimepicker'; // 날짜 선택 컴포넌트
import { PieChart } from 'react-native-chart-kit'; // 원형 차트 컴포넌트
import { Picker } from '@react-native-picker/picker'; // 선택기 컴포넌트
import Icon from 'react-native-vector-icons/Ionicons'; // 아이콘 컴포넌트
import * as d3 from 'd3-scale-chromatic'; // D3 색상 팔레트

const Statistics = () => {
  const [totalSales, setTotalSales] = useState(0); // 총 매출 상태
  const [ordersList, setOrdersList] = useState([]); // 주문 목록 상태
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜 상태
  const [showDatePicker, setShowDatePicker] = useState(false); // 날짜 선택기 표시 상태
  const [sortOption, setSortOption] = useState('salesCount'); // 정렬 옵션 상태
  const [chartData, setChartData] = useState([]); // 차트 데이터 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const screenWidth = Dimensions.get('window').width; // 화면 너비

  // 날짜 포맷팅 함수
  const getFormattedDate = (date) => {
    const year = date.getFullYear().toString().slice(-2); // 연도
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월
    const day = date.getDate().toString().padStart(2, '0'); // 일
    return `${year}${month}${day}`; // YYYYMMDD 형식 반환
  };

  // 주문 데이터 가져오기 함수
  const fetchOrders = async (date) => {
    const dateString = getFormattedDate(date); // 포맷된 날짜 문자열
    setIsLoading(true); // 데이터 로딩 시작
    try {
      const ordersSnapshot = await getDocs(
        collection(firestore, 'orders', dateString, 'orders') // Firestore에서 주문 데이터 가져오기
      );
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(), // 주문 데이터
      }));
      setOrdersList(ordersData); // 주문 목록 상태 업데이트
      calculateTotalSales(ordersData); // 총 매출 계산
    } catch (error) {
      console.error('주문 정보를 가져오는 중 오류 발생:', error);
      Alert.alert('오류', '주문 정보를 가져오는 중 오류가 발생했습니다.'); // 오류 알림
    } finally {
      setIsLoading(false); // 데이터 로딩 종료
    }
  };

  // 총 매출 계산 함수
  const calculateTotalSales = (ordersData) => {
    const total = ordersData.reduce(
      (sum, order) => sum + (parseFloat(order.total) || 0), // 각 주문의 총액 합산
      0
    );
    setTotalSales(total); // 총 매출 상태 업데이트
  };

  // 컴포넌트 마운트 시 주문 데이터 가져오기
  useEffect(() => {
    fetchOrders(selectedDate);
  }, []);

  // 정렬 옵션이나 주문 목록이 변경될 때마다 차트 데이터 업데이트
  useEffect(() => {
    setChartData(getSortedData());
  }, [sortOption, ordersList]);

  // 날짜 변경 핸들러
  const onDateChange = (event, date) => {
    setShowDatePicker(false); // 날짜 선택기 숨기기
    if (date) {
      setSelectedDate(date); // 선택된 날짜 상태 업데이트
      fetchOrders(date); // 선택된 날짜로 주문 데이터 가져오기
    }
  };

  // 메뉴별 매출 데이터 가져오기 함수
  const getMenuSalesData = () => {
    const salesData = {}; // 메뉴별 매출 데이터 저장 객체
    ordersList.forEach((order) => {
      order.menuList.forEach((menu) => {
        const menuName = menu.menuName; // 메뉴 이름
        const menuTotal = parseFloat(menu.price) * parseInt(menu.quantity, 10); // 메뉴 총액
        const menuCount = parseInt(menu.quantity, 10); // 메뉴 수량

        if (salesData[menuName]) {
          salesData[menuName].total += menuTotal; // 총액 업데이트
          salesData[menuName].count += menuCount; // 수량 업데이트
        } else {
          salesData[menuName] = {
            total: menuTotal,
            count: menuCount,
          };
        }
      });
    });

    // 메뉴 이름, 총액, 수량으로 구성된 배열 반환
    return Object.entries(salesData).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
    }));
  };

  // 매출 데이터 정렬 함수
  const getSortedData = () => {
    const menuData = getMenuSalesData(); // 메뉴별 매출 데이터 가져오기
    return menuData
      .sort((a, b) =>
        sortOption === 'salesCount' ? b.count - a.count : b.total - a.total // 정렬 옵션에 따라 정렬
      )
      .slice(0, 6); // 상위 6개 데이터 반환
  };

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (itemValue) => {
    setSortOption(itemValue); // 정렬 옵션 상태 업데이트
  };

  // 차트 데이터 업데이트
  useEffect(() => {
    const sortedData = getSortedData(); // 정렬된 데이터 가져오기
    const updatedChartData = sortedData.map((item, index) => ({
      name: item.name,
      population: sortOption === 'salesCount' ? parseInt(item.count) : parseInt(item.total), // 인구 수 결정
      color: d3.schemeCategory10[index % 10], // D3 색상 팔레트 사용
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
      label: `${item.name}: ${sortOption === 'salesCount' ? item.count : item.total.toLocaleString()} 원`, // 레이블 형식
    }));

    setChartData(updatedChartData); // 차트 데이터 상태 업데이트
  }, [sortOption, ordersList]);

  return (
    <ScrollView style={styles.container}>
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

      {isLoading ? ( // 로딩 상태에 따라 표시
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <>
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

          {ordersList.length === 0 ? (
            <Text style={styles.noDataText}>매출 내역이 없습니다</Text>
          ) : (
            <>
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
                accessor="population" // 데이터에서 접근할 키
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]} // 차트 중앙 위치 조정
              />

              <View style={styles.orderList}>
                {getSortedData().map(item => ( // 정렬된 데이터 목록 표시
                  <View key={item.name} style={styles.orderItem}>
                    <Text>
                      {item.name}: {item.count}건 / {item.total.toLocaleString()} 원
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
          <View style={styles.bottomSpacing} />
        </>
      )}
    </ScrollView>
  );
};

// 스타일 정의
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
    elevation: 1,
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
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
  orderList: {
    marginTop: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: '40%',
  },
  bottomSpacing: {
    height: 20,
  },
  loader: {
    alignSelf: 'center',
    marginTop: '50%',
  },
});

export default Statistics;
