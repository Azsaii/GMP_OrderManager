import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OrderManagement from './screens/OrderManagement';
import Statistics from './screens/Statistics';
import CouponManagement from './screens/CouponManagement'; // 쿠폰 관리 스크린 임포트
import Icon from 'react-native-vector-icons/Ionicons'; // 아이콘 라이브러리 임포트
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['2024']); // 경고메시지 제거

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: true,
        }}
      >
        <Tab.Screen
          name="주문 관리"
          component={OrderManagement}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="매출 통계"
          component={Statistics}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="쿠폰 관리"
          component={CouponManagement} // 쿠폰 관리 스크린 추가
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="pricetag-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
