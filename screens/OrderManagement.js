import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator, // 로딩 인디케이터 추가
  TouchableOpacity,
} from 'react-native';
import { firestore } from '../firebaseConfig'; // Firestore 설정 가져오기
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'; // Firestore에서 데이터 가져오기 및 업데이트
import { Picker } from '@react-native-picker/picker'; // 선택기 컴포넌트
import DateTimePicker from '@react-native-community/datetimepicker'; // 날짜 선택기 컴포넌트
import OrderDetailModal from '../components/OrderDetailModal'; // 주문 상세보기 모달 컴포넌트
import Icon from 'react-native-vector-icons/Ionicons'; // 아이콘 컴포넌트

const OrderManagement = () => {
  const [orders, setOrders] = useState([]); // 주문 목록 상태
  const [isModalVisible, setModalVisible] = useState(false); // 상세보기 모달 표시 상태
  const [selectedOrder, setSelectedOrder] = useState(null); // 선택된 주문 상태
  const [filter, setFilter] = useState('조리 전'); // 주문 필터 상태
  const [sortOrder, setSortOrder] = useState('내림차순'); // 정렬 순서 상태
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜 상태
  const [showDatePicker, setShowDatePicker] = useState(false); // 날짜 선택기 표시 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태

  // 날짜를 YYYYMMDD 형식으로 포맷팅하는 함수
  const formatDate = (date) => {
    const year = date.getFullYear().toString().slice(-2); // 연도
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월
    const day = date.getDate().toString().padStart(2, '0'); // 일
    return `${year}${month}${day}`; // YYYYMMDD 형식 반환
  };

  // Firestore에서 주문 정보를 가져오는 함수
  const fetchOrders = async () => {
    setIsLoading(true); // 데이터 로딩 시작
    const dateString = formatDate(selectedDate); // 선택된 날짜 포맷팅
    try {
      const ordersSnapshot = await getDocs(
        collection(firestore, 'orders', dateString, 'orders') // Firestore에서 주문 데이터 가져오기
      );
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id, // 주문 ID
        ...doc.data(), // 주문 데이터
      }));
      setOrders(processOrders(ordersData)); // 주문 처리 함수 호출로 필터링 및 정렬된 주문 목록 상태 업데이트
    } catch (error) {
      console.error('주문 정보를 가져오는 중 오류 발생:', error);
      Alert.alert('오류', '주문 정보를 가져오는 중 오류가 발생했습니다.'); // 오류 알림
    } finally {
      setIsLoading(false); // 데이터 로딩 종료
    }
  };

  // 주문 데이터 필터링 및 정렬 처리 함수
  const processOrders = (ordersData) => {
    // 필터링된 주문 목록 생성
    const filteredOrders = ordersData.filter((order) => {
      if (filter === '조리 전') {
        return !order.isStarted && !order.isCompleted; // 조리 전인 주문
      } else if (filter === '조리 시작') {
        return order.isStarted && !order.isCompleted; // 조리 중인 주문
      } else if (filter === '조리 완료') {
        return order.isStarted && order.isCompleted; // 조리 완료된 주문
      }
      return true; // 기본적으로 모든 주문 반환
    });

    // 정렬된 주문 목록 반환
    return filteredOrders.sort((a, b) => {
      const dateA = Date.parse(a.createdAt); // 문자열을 숫자로 변환
      const dateB = Date.parse(b.createdAt);
      return sortOrder === '내림차순' ? dateB - dateA : dateA - dateB; // 정렬 순서에 따라 정렬
    });
  };

  // 필터, 정렬 순서, 선택된 날짜 변경 시 주문 데이터 가져오기
  useEffect(() => {
    fetchOrders(); // 주문 데이터 가져오기 호출
  }, [filter, sortOrder, selectedDate]);

  // 주문 목록을 다시 가져오는 함수
  const refreshOrders = () => {
    fetchOrders(); // 주문 데이터 다시 가져오기
  };

  // 주문 상태 변경 핸들러
  const handleStatusChange = async (orderId, newStatus) => {
    // 상세보기 선택 시 모달 열기
    if (newStatus === '상세 보기') {
      const orderToView = orders.find((order) => order.id === orderId); // 선택된 주문 찾기
      setSelectedOrder(orderToView); // 선택된 주문 상태 업데이트
      setModalVisible(true); // 모달 표시
      return;
    }

    const orderRef = doc(
      firestore,
      'orders',
      formatDate(selectedDate),
      'orders',
      orderId
    ); // Firestore에서 주문 참조 생성

    // 주문 상태에 따라 플래그 설정
    let isStarted = newStatus !== '조리 전'; // 조리 시작 상태
    let isCompleted = newStatus === '조리 완료'; // 조리 완료 상태

    try {
      await updateDoc(orderRef, { isStarted, isCompleted }); // 주문 상태 업데이트
      fetchOrders(); // 업데이트된 주문 데이터 다시 가져오기
    } catch (error) {
      console.error('주문 상태 업데이트 중 오류 발생:', error);
      Alert.alert('오류', '주문 상태 업데이트 중 오류가 발생했습니다.'); // 오류 알림
    }
  };

  // 주문 아이템 렌더링 함수
  const renderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text>주문 ID: {item.id}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={
            item.isCompleted
              ? '조리 완료'
              : item.isStarted
              ? '조리 시작'
              : '조리 전'
          }
          onValueChange={
            (itemValue) => handleStatusChange(item.id, itemValue) // 상태 변경 핸들러 호출
          }
        >
          <Picker.Item label="조리 전" value="조리 전" />
          <Picker.Item label="조리 시작" value="조리 시작" />
          <Picker.Item label="조리 완료" value="조리 완료" />
          <Picker.Item label="상세 보기" value="상세 보기" />
        </Picker>
      </View>
    </View>
  );

  // 날짜 선택기 표시 함수
  const showDatePickerModal = () => {
    setShowDatePicker(true); // 날짜 선택기 표시
  };

  // 날짜 선택 후 처리 함수
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // 날짜 선택기 숨기기
    if (selectedDate) {
      setSelectedDate(selectedDate); // 선택된 날짜 상태 업데이트
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={showDatePickerModal} style={styles.dateText}>
          선택된 날짜:{' '}
          {`${selectedDate.getFullYear()}년 ${(selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}월 ${selectedDate
            .getDate()
            .toString()
            .padStart(2, '0')}일`}
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

      <View style={styles.filters}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filter} // 현재 필터 상태
            style={styles.picker}
            onValueChange={(itemValue) => setFilter(itemValue)} // 필터 변경 핸들러
          >
            <Picker.Item label="조리 전" value="조리 전" />
            <Picker.Item label="조리 시작" value="조리 시작" />
            <Picker.Item label="조리 완료" value="조리 완료" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sortOrder} // 현재 정렬 순서 상태
            style={styles.picker}
            onValueChange={(itemValue) => setSortOrder(itemValue)} // 정렬 순서 변경 핸들러
          >
            <Picker.Item label="내림차순" value="내림차순" />
            <Picker.Item label="오름차순" value="오름차순" />
          </Picker>
        </View>
        {/* 새로고침 버튼*/}
        <TouchableOpacity style={styles.refreshButton} onPress={refreshOrders}>
          <Icon name="refresh-outline" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {isLoading ? ( // 로딩 상태에 따라 표시
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : orders.length === 0 ? ( // 주문이 없는 경우
        <Text style={styles.noOrdersText}>주문 내역이 없습니다</Text>
      ) : (
        <FlatList
          data={orders} // 주문 데이터
          keyExtractor={(item) => item.id} // 각 아이템의 고유 키
          renderItem={renderItem} // 아이템 렌더링 함수
          contentContainerStyle={styles.list} // 리스트 스타일
        />
      )}

      {/* 주문 상세보기 모달 */}
      <OrderDetailModal
        isVisible={isModalVisible} // 모달 표시 상태
        onClose={() => setModalVisible(false)} // 모달 닫기 핸들러
        order={selectedOrder} // 선택된 주문 데이터
      />
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa', // 배경색
  },
  header: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff', // 헤더 배경색
    borderRadius: 10,
    shadowColor: '#000', // 그림자 색상
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 1, // 안드로이드에서 그림자 효과
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#333', // 날짜 텍스트 색상
    marginRight: 10,
    flex: 1, // 공간을 차지하도록 설정
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  icon: {
    marginLeft: 10,
    alignSelf: 'center', // 아이콘 세로 중앙 정렬
  },
  pickerContainer: {
    height: 52,
    width: '40%', // 픽커 너비
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#ffffff', // 주문 아이템 배경색
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  list: {
    paddingBottom: 20,
  },
  loader: {
    alignSelf: 'center',
    marginTop: '40%', // 로딩 인디케이터 위치
  },
  noOrdersText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: '40%',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    marginLeft: 10, // 드롭다운과 간격
  },
});

export default OrderManagement; // 컴포넌트 내보내기
