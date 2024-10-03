import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OrderManagement from './screens/OrderManagement';
import Statistics from './screens/Statistics';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="주문 관리" component={OrderManagement} />
        <Tab.Screen name="통계" component={Statistics} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
