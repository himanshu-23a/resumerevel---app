import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from './components/SplashScreen';
import Login from './components/Login';
import Signup from './components/Signup';
import EmailVerificationScreen from './components/EmailVerificationScreen';
import Home from './components/Home';
import ResumeView from './components/ResumeView';
import CompanyHome from './components/CompanyHome';
import CompanyForm from './components/CompanyForm';
import Logout from './components/Logout';

import { Image, TouchableOpacity } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName='SplashScreen'
      screenOptions={{
        headerStyle: {
          backgroundColor: '#04080F',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      }}
    >
      <Stack.Screen name='SplashScreen' component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
      <Stack.Screen name='Signup' component={Signup} options={{ headerShown: false }} />
      <Stack.Screen name='EmailVerificationScreen' component={EmailVerificationScreen} options={{ headerShown: false }} />
      <Stack.Screen name='Main' component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name='ResumeView' component={ResumeView} options={{ title: 'View Resume' }} />
      <Stack.Screen name='CompanyForm' component={CompanyForm} options={{ title: 'Job Form' }} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          display: 'none'
        },
        tabBarStyle: {
          backgroundColor: '#04080F'
        },
        tabBarIconStyle: {
          color: 'white'
        }
      }}
    >
      <Tab.Screen
        name='Home'
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? require('./icons/homeF.png') : require('./icons/homeNF.png')}
              style={{ width: 32, height: 32 }}
              accessibilityLabel='Home'
            />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name='CompanyHome'
        component={CompanyHome}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? require('./icons/ChomeF.png') : require('./icons/ChomeNF.png')}
              style={{ width: 32, height: 32 }}
              accessibilityLabel='Company Insights'
            />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name='Logout'
        component={Logout}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? require('./icons/logout.png') : require('./icons/logoutNF.png')}
              style={{ width: 32, height: 32 }}
              accessibilityLabel='Company Insights'
            />
          ),
          headerShown: false
        }}
      />

    </Tab.Navigator>
  );
};


export default App;
