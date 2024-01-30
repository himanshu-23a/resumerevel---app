import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import viewInsightsIcon from '../icons/viewInsights.png'
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';

API_KEY = 'AIzaSyBrz7otKhlUaX8IYLCWy6ph4MXgWlqQMVU';
const genAI = new GoogleGenerativeAI(API_KEY);

//Function Starts
const ResumeInsights = (resumeUrl) => {

    const navigation = useNavigation();
    const user = auth().currentUser;

    const [isInsightsAvail, setIsInsightsAvail] = useState(false);
    const [insights, setInsights] = useState({
        overallScore: '',
        summary: '',
        skills: '',
        keywords: '',
        formattingScore: '',
        jobs: '',
        feedback: '',
    });

    const [resumeData, setResumeData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        //Initially - to check resume is available on cloud or not
        const initialCheck = async () => {
            setIsLoading(true)
            const userRef = firestore().collection('users').doc(user.uid);
            await userRef.get()
                .then((doc) => {
                    if (doc.exists && doc.data().insights) {
                        setInsights(doc.data().insights);
                        console.log('Insights available!', doc.data().insights);
                        setIsInsightsAvail(true);
                    }
                    if (doc.exists && doc.data().resumeData) {
                        setResumeData(doc.data().resumeData);
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


    //Function to generate insights
    const insightFunction = async () => {
        console.log("insight function called");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
            //To get overall score 
            try {
                const prompt = `Rate the overall quality of this resume on a scale of 0-100, considering experience, skills, and formatting.(response with only the score that is one word)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Overall Score", text);
                setInsights((prevInsights) => {
                    const updatedInsights = { ...prevInsights, overallScore: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get summary
            try {
                const prompt = `Summarize the key skills and experiences highlighted in this resume.(Provide in a single paragraph)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Summary", text);
                setInsights((prevInsights) => {
                    const updatedInsights = { ...prevInsights, summary: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get Skills
            try {
                const prompt = `Extract and List the primary technical skills from this resume. (Only provide list with bullet points)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Skills", text);
                setInsights((prevInsights) => {
                    const updatedInsights = { ...prevInsights, skills: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get keywords
            try {
                const prompt = `Extract and List the most prominent keywords from this resume. (Only provide list with bullet points.Maximum 10 keywords)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Keywords", text);
                setInsights((prevInsights) => {
                    const updatedInsights = { ...prevInsights, keywords: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get formatting Score
            try {
                const prompt = `Rate the professionalism and readability of this resume's layout and design. Provide a score from 0 to 100 (response with only the score that is one word)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Formatting Score", text);
                setInsights((prevInsights) => {
                    const updatedInsights = { ...prevInsights, formattingScore: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get suggested jobs
            try {
                const prompt = `Based on the skills and experience in this resume, list out suitable job titles for the candidate. (Only provide list with bullet points)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Jobs REcommended", text);
                setInsights((prevInsights) => {
                    const updatedInsights = { ...prevInsights, jobs: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get feedback & improvement
            try {
                const prompt = `Provide constructive feedback on this resume, highlighting strengths and areas for improvement.(Response in a single paragraph)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Feedback & Improvement: ", text);
                setInsights((prevInsights) => {
                    const updatedInsights = { ...prevInsights, feedback: text };
                    //To update the insights in the firebase
                    const userRef = firestore().collection('users').doc(user.uid);
                    console.log("Insights: ", updatedInsights);
                    userRef.set({
                        insights: updatedInsights,
                    }, { merge: true })
                        .then(() => {
                            console.log('Insights stored in Firestore')
                        })
                        .catch((error) => {
                            setIsLoading(false);
                            console.error('Error storing insights in firestore: ', error);
                        });
                    return updatedInsights;
                });
            } catch (err) {
                setIsLoading(false);
                console.log("Error in this :", err);
            }
        } catch (error) {
            setIsLoading(false);
            console.log("Error in generating insights: ", error);
        }
    };

    const handleInsightButton = async () => {
        setIsLoading(true);
        await insightFunction();
        setIsLoading(false);
        setIsInsightsAvail(true);
    };

    const handleDeleteResume = async () => {
        Alert.alert('Alert', 'Are you sure to Delete Resume ?', [
            {
                text: 'Cancel',
                onPress: () => {
                    console.log('Cancel');
                },
            },
            {
                text: 'Ok',
                onPress: async () => {
                    console.log('Ok ')
                    const userRef = firestore().collection('users').doc(user.uid);
                    const storageRef = storage().ref(`/Resume/${user.uid}`);

                    try {
                        setIsLoading(true);
                        await storageRef.delete();
                        await userRef.update({
                            resumeUrl: firestore.FieldValue.delete(),
                            resumeData: firestore.FieldValue.delete(),
                            insights: firestore.FieldValue.delete(),
                            companyJob: firestore.FieldValue.delete(),
                            companyInsights: firestore.FieldValue.delete()
                        });
                        console.log("File deleted successfully from storage and Firestore");
                        setIsLoading(false);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Main' }],
                        });
                    } catch (err) {
                        setIsLoading(false);
                        console.error("Error deleting file or updating Firestore:", err);
                    }
                },
            },
        ]);
    };

    return (
        <>
            {!isLoading ? (
                isInsightsAvail ? (
                    <View style={{ flex: 1 }}>
                        <View style={styles.buttonRow}>
                            <Text style={[styles.headText, { fontWeight: 500 }]}>Resume Insights</Text>
                            <TouchableOpacity
                                onPress={() => { navigation.navigate('ResumeView', { resumeUrl }) }}
                            >
                                <Text style={[styles.button, { backgroundColor: '#dae3e5', borderRadius: 50, fontWeight: 600 }]}>View Resume</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <View style={styles.scoreRow}>
                                <View style={[styles.card, { flex: 1, backgroundColor: "#a7bed3", }]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>Overall Score</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.cardBody}>
                                        <Text style={[styles.description, { fontWeight: 600, fontSize: 18 }]}>{insights.overallScore}</Text>
                                    </View>
                                </View>
                                <View style={[styles.card, { flex: 1, backgroundColor: "#f1ffc4", }]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>Formatting Score</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.cardBody}>
                                        <Text style={[styles.description, { fontWeight: 600, fontSize: 18 }]}>{insights.formattingScore}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.card, { backgroundColor: "#ffcaaf" }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.title}>Summary</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.cardBody}>
                                    <Text style={[styles.description, { fontWeight: 500 }]}>{insights.summary}</Text>
                                </View>
                            </View>
                            <View style={styles.scoreRow}>
                                <View style={[styles.card, { flex: 1, backgroundColor: "#c6e2e9" }]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>Skills</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.cardBody}>
                                        <Text style={[styles.description, { fontWeight: 500 }]}>{insights.skills}</Text>
                                    </View>
                                </View>
                                <View style={[styles.card, { flex: 1, backgroundColor: "#dab894" }]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>Keywords</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.cardBody}>
                                        <Text style={[styles.description, { fontWeight: 500 }]}>{insights.keywords}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.card, { backgroundColor: "#f1ffc4" }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.title}>Jobs Recommended</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.cardBody}>
                                    <Text style={[styles.description, { fontWeight: 500 }]}>{insights.jobs}</Text>
                                </View>
                            </View>
                            <View style={[styles.card, { backgroundColor: "#c6e2e9" }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.title}>Feedback</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.cardBody}>
                                    <Text style={[styles.description, { fontWeight: 500 }]}>{insights.feedback}</Text>
                                </View>
                            </View>
                        </ScrollView >

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                onPress={handleInsightButton}
                            >
                                <Text style={[styles.button, { fontWeight: 600 }]}>Regenerate Analysis</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDeleteResume}
                            >
                                <Text style={[styles.button, { backgroundColor: '#D2122E', fontWeight: 600, color: 'white' }]}>Delete Resume</Text>
                            </TouchableOpacity>
                        </View>
                    </View >
                ) : (
                    <View style={styles.inContainer}>
                        <Image source={viewInsightsIcon} style={styles.viewinsightsicon} />
                        <TouchableOpacity
                            onPress={() => { navigation.navigate('ResumeView', { resumeUrl }) }}
                        >
                            <Text style={[styles.button, { fontWeight: 600 }]}>View Resume</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleInsightButton}
                        >
                            <Text style={[styles.button, { fontWeight: 600 }]}>Generate Insights</Text>
                        </TouchableOpacity>

                    </View>
                )
            ) : (
                <View style={styles.inContainer}>
                    <ActivityIndicator size='large' color='#A1C6EA' />
                    <Text style={{ fontSize: 16, margin: 10 ,color:'#A1C6EA' }}>Loading...This may take longer than usual!</Text>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    inContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headText: {
        margin: 10,
        fontSize: 22,
        color: '#A1C6EA'
    },
    viewinsightsicon: {
        width: 100,
        height: 100,
        marginVertical: 20
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    button: {
        fontSize: 18,
        padding: 12,
        marginHorizontal: 8,
        marginVertical: 10,
        borderRadius: 8,
        backgroundColor: '#A1C6EA',
        color: '#04080F'
    },
    scoreRow: {
        flexDirection: 'row',
    },
    divider: {
        backgroundColor: '#04080f',
        height: 1,
        marginTop: 10
    },
    card: {
        borderRadius: 8,
        padding: 16,
        margin: 5,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#04080f",
    },
    cardBody: {
        marginTop: 16,
    },
    description: {
        fontSize: 16,
        color: "#04080f",
    },
});

export default ResumeInsights;