import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import CompanyInsights from './CompanyInsights';
import companyJobIcon from '../icons/job.png'
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

const CompanyHome = () => {

    const user = auth().currentUser;
    const navigation = useNavigation();

    const [isComapnyJob, setIsCompanyJob] = useState(false);
    const [isResume, setIsResume] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        //Initially - to check company job is available on cloud or not
        const initialCheck = async () => {
            setIsLoading(true);
            const userRef = firestore().collection('users').doc(user.uid);
            await userRef.get()
                .then((doc) => {
                    if (doc.exists && doc.data().resumeUrl) {
                        setIsResume(true);
                    }
                    if (doc.exists && doc.data().companyJob) {
                        setIsCompanyJob(true);
                    }
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                    console.error('Error getting user document: ', error);
                })
            setIsLoading(false);
        }
        initialCheck();
    }, []);

    const uploadCompanyForm = () => {
        navigation.navigate('CompanyForm');
    };

    return (
        <View style={styles.container}>
            {!isLoading ? (
                isResume ? (
                    !isComapnyJob ? (
                        < View style={styles.inContainer}>
                            <Image source={companyJobIcon} style={styles.companyjobicon} />
                            <TouchableOpacity
                                onPress={uploadCompanyForm}
                            >
                                <Text style={[styles.uploadButton, { fontWeight: 600 }]}>Job Form</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <CompanyInsights />
                    )
                ) : (
                    < View style={styles.inContainer}>
                        <Text style={{ fontSize: 20, color: '#A1C6EA', textAlign: 'center' }}>Upload Your Resume to View Insights</Text>
                    </View>)

            ) : (
                <View style={styles.inContainer}>
                    <ActivityIndicator size='large' color='#A1C6EA' />
                    <Text style={{ fontSize: 16, margin: 10 ,color:'#A1C6EA' }}>Loading...This may take longer than usual!</Text>
                </View>
            )}

        </View >
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#04080f',
    },
    inContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyjobicon: {
        width: 100,
        height: 100
    },
    uploadButton: {
        fontSize: 18,
        padding: 12,
        marginHorizontal: 10,
        marginVertical: 30,
        borderRadius: 8,
        backgroundColor: '#A1C6EA',
        color: '#04080F'
    }
});

export default CompanyHome;