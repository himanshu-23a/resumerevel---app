import React, { useState } from 'react';
import { useRoute } from '@react-navigation/native';
// import Pdf from 'react-native-pdf';
import { useNavigation } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView
} from 'react-native';

const ResumeView = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const resumeUrl = route.params?.resumeUrl;
    console.log("Received Url here: ", resumeUrl.resumeUrl);
    const screenWidth = Dimensions.get('window').width;
    return (
        <View style={styles.container}>
            <ScrollView>
                <Image
                    source={{ uri: resumeUrl.resumeUrl }}
                    style={{marginTop: 10 , width: screenWidth-20, height: 800, resizeMode:'contain' }}
                    resizeMode="contain"
                />
            </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#04080f',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pdfStyle: {
        flex: 1,
        width: Dimensions.get('window').width,
        //backgroundColor: '#04080f'
    }
})

export default ResumeView;