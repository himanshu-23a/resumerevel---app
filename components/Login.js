import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import loginIcon from '../icons/login.png'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from 'react-native';

const Login = () => {
    const [email, setEmail] = useState(undefined);
    const [password, setPassword] = useState(undefined);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation();

    const handleLogin = async () => {
        if (email && password) {
            try {
                setIsLoading(true);
                const user = await auth().signInWithEmailAndPassword(email, password);
                console.log("isUserLogin: ", user);
                setErrorMessage(undefined);

                if (user.user.emailVerified) {
                    setIsLoading(false);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                }
                else {
                    setIsLoading(false);
                    navigation.replace('EmailVerificationScreen');
                }
            } catch (err) {
                setIsLoading(false);
                console.log("Login", err);
                setErrorMessage(err.message);
            }
        }
        else {
            setErrorMessage("Enter Email/Passowrd")
        }

    }

    return (
        <View style={styles.container}>
            <Image source={loginIcon} style={styles.loginicon} />
            <Text style={styles.headText}>Login</Text>
            <TextInput
                style={styles.inputBox}
                placeholder='Email'
                placeholderTextColor='#808080'
                value={email}
                onChangeText={(value) => setEmail(value)}
            />
            <TextInput
                style={styles.inputBox}
                placeholder='Password'
                placeholderTextColor='#808080'
                value={password}
                onChangeText={(value) => setPassword(value)}
                secureTextEntry={true}
            />
            {errorMessage &&
                <Text style={{ color: 'red' }}>{errorMessage}</Text>
            }
            {!isLoading ? (
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={{ fontSize: 20, fontWeight: '500', color: "#04080F" }}>Login</Text>
                </TouchableOpacity>
            ) : (
                <ActivityIndicator size='large' color='#A1C6EA' />
            )
            }
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={{ marginTop: 15, color: '#A1C6EA' }}>Don't have account? Signup</Text>
            </TouchableOpacity>
        </View>
    )
}

const { height, width } = Dimensions.get("screen")
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04080f',
    },
    headText: {
        color: '#A1C6EA',
        fontSize: 20,
        margin: 10
    },
    loginicon: {
        width: 70,
        height: 70,
    },
    inputBox: {
        width: width - 40,
        borderWidth: 2,
        borderColor: '#A1C6EA',
        color: '#DAE3E5',
        fontSize: 20,
        padding: 15,
        marginBottom: 15,
        borderRadius: 10
    },
    loginButton: {
        width: width - 40,
        marginTop: 10,
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: '#A1C6EA',
        borderRadius: 50,
        padding: 15
    }
})
export default Login;