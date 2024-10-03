import React from 'react';
import { View, Text, Button } from 'react-native';
import Modal from 'react-native-modal';

const OrderDetailModal = ({ isVisible, onClose, order }) => {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
        {order ? (
          <>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              고객 이름: {order.customerName || '정보 없음'}
            </Text>
            <Text>고객 ID: {order.customerId || '정보 없음'}</Text>

            {/* menuList가 존재하는지 확인 */}
            {order.menuList && order.menuList.length > 0 ? (
              order.menuList.map((item, index) => (
                <View key={index} style={{ marginVertical: 8 }}>
                  <Text>메뉴 이름: {item.menuName || '정보 없음'}</Text>
                  <Text>메뉴 ID: {item.menuId || '정보 없음'}</Text>
                  <Text>수량: {item.quantity || '정보 없음'}</Text>
                  <Text>
                    옵션: {item.options ? item.options.join(', ') : '정보 없음'}
                  </Text>
                </View>
              ))
            ) : (
              <Text>메뉴 항목이 없습니다.</Text> // 메뉴 항목이 없을 경우 메시지
            )}

            {/* 총 가격 표시 */}
            {order.total !== undefined ? (
              <Text style={{ marginTop: 20, fontSize: 16 }}>
                총 가격: {order.total.toLocaleString()} 원
              </Text>
            ) : (
              <Text>총 가격 정보가 없습니다.</Text> // 총 가격 정보가 없을 경우 메시지
            )}
          </>
        ) : (
          <Text>주문이 없습니다.</Text> // 주문이 없을 경우 메시지
        )}
        <Button title="닫기" onPress={onClose} />
      </View>
    </Modal>
  );
};

export default OrderDetailModal;
