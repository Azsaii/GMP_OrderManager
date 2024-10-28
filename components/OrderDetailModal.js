import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';

const OrderDetailModal = ({ isVisible, onClose, order }) => {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {order ? (
            <>
              <Text style={styles.title}>주문 ID: {order.id}</Text>
              <Text style={styles.subtitle}>
                고객명: {order.customerName || '정보 없음'}
              </Text>

              {order.menuList && order.menuList.length > 0 ? (
                order.menuList.map((item, index) => (
                  <View key={index} style={styles.menuItem}>
                    <Text style={styles.menuText}>
                      메뉴 이름: {item.menuName || '정보 없음'}
                    </Text>
                    <Text style={styles.menuText}>
                      수량: {item.quantity || '정보 없음'}
                    </Text>
                    {/* item.options에 "isDessert"가 포함되어 있는지 확인 */}
                    {item.options &&
                    item.options.includes('isDessert') ? null : (
                      <Text style={styles.menuText}>
                        옵션:{' '}
                        {item.options ? item.options.join(', ') : '정보 없음'}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text>메뉴 항목이 없습니다.</Text>
              )}

              {order.total !== undefined ? (
                <Text style={styles.totalPrice}>
                  총 가격: {order.total.toLocaleString()} 원
                </Text>
              ) : (
                <Text>총 가격 정보가 없습니다.</Text>
              )}
            </>
          ) : (
            <Text>주문이 없습니다.</Text>
          )}
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '80%', // 모달의 최대 높이를 80%로 설정
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
  },
  menuItem: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  menuText: {
    fontSize: 14,
    marginBottom: 5,
  },
  totalPrice: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default OrderDetailModal;
