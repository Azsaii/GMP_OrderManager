import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import OrderDetailModal from '../components/OrderDetailModal';
import Icon from 'react-native-vector-icons/Ionicons';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('조리 전');
  const [sortOrder, setSortOrder] = useState('내림차순');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const dateString = formatDate(selectedDate);
      try {
        const ordersSnapshot = await getDocs(
          collection(firestore, 'orders', dateString, 'orders')
        );
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredOrders = ordersData.filter((order) => {
          if (filter === '조리 전') {
            return !order.isStarted && !order.isCompleted;
          } else if (filter === '조리 시작') {
            return order.isStarted && !order.isCompleted;
          } else if (filter === '조리 완료') {
            return order.isStarted && order.isCompleted;
          }
          return true;
        });

        const sortedOrders = filteredOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return sortOrder === '내림차순' ? dateB - dateA : dateA - dateB;
        });

        setOrders(sortedOrders);
      } catch (error) {
        console.error('주문 정보를 가져오는 중 오류 발생:', error);
        Alert.alert('오류', '주문 정보를 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchOrders();
  }, [filter, sortOrder, selectedDate]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === '상세 보기') {
      const orderToView = orders.find((order) => order.id === orderId);
      setSelectedOrder(orderToView);
      setModalVisible(true);
      return;
    }

    const orderRef = doc(
      firestore,
      'orders',
      formatDate(selectedDate),
      'orders',
      orderId
    );
    let isStarted = false;
    let isCompleted = false;

    if (newStatus === '조리 시작') {
      isStarted = true;
    } else if (newStatus === '조리 완료') {
      isStarted = true;
      isCompleted = true;
    }

    try {
      await updateDoc(orderRef, { isStarted, isCompleted });
      const updatedOrdersSnapshot = await getDocs(
        collection(firestore, 'orders', formatDate(selectedDate), 'orders')
      );
      const updatedOrdersData = updatedOrdersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredOrders = updatedOrdersData.filter((order) => {
        if (filter === '조리 전') {
          return !order.isStarted && !order.isCompleted;
        } else if (filter === '조리 시작') {
          return order.isStarted && !order.isCompleted;
        } else if (filter === '조리 완료') {
          return order.isStarted && order.isCompleted;
        }
        return true;
      });

      const sortedOrders = filteredOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === '내림차순' ? dateB - dateA : dateA - dateB;
      });

      setOrders(sortedOrders);
    } catch (error) {
      console.error('주문 상태 업데이트 중 오류 발생:', error);
      Alert.alert('오류', '주문 상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.orderItem}>
        <Text>주문 ID: {item.id}</Text>
        <Picker
          selectedValue={
            item.isCompleted
              ? '조리 완료'
              : item.isStarted
              ? '조리 시작'
              : '조리 전'
          }
          style={styles.picker}
          onValueChange={(itemValue) => handleStatusChange(item.id, itemValue)}
        >
          <Picker.Item label="조리 전" value="조리 전" />
          <Picker.Item label="조리 시작" value="조리 시작" />
          <Picker.Item label="조리 완료" value="조리 완료" />
          <Picker.Item label="상세 보기" value="상세 보기" />
        </Picker>
      </View>
    );
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
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
        <Picker
          selectedValue={filter}
          style={styles.picker}
          onValueChange={(itemValue) => setFilter(itemValue)}
        >
          <Picker.Item label="조리 전" value="조리 전" />
          <Picker.Item label="조리 시작" value="조리 시작" />
          <Picker.Item label="조리 완료" value="조리 완료" />
        </Picker>

        <Picker
          selectedValue={sortOrder}
          style={styles.picker}
          onValueChange={(itemValue) => setSortOrder(itemValue)}
        >
          <Picker.Item label="내림차순" value="내림차순" />
          <Picker.Item label="오름차순" value="오름차순" />
        </Picker>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <OrderDetailModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        order={selectedOrder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
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
    alignItems: 'center', // 세로 중앙 정렬
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
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
  picker: {
    height: 50,
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  list: {
    paddingBottom: 20,
  },
});

export default OrderManagement;
