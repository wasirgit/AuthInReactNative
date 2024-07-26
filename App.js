import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
// initialize database
const initializeDatabase = async (db) => {
  try {
    await db.execAsync(
      `PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,  
      username TEXT UNIQUE, 
      password TEXT
      );
    `
    );
    console.log("Database initialized ");
  } catch (error) {
    console.log("Error while initialize database", error);
  }
};

//create a stack navigator that manages the navigation between 3 screens (Login, Register and Home)
const Stack = createStackNavigator();
export default function App() {
  return (
    <SQLiteProvider databaseName="auth.db" onInit={initializeDatabase}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}

const LoginScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (userName.length == 0 || password.length == 0) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }
    try {
      const user = await db.getFirstAsync(
        "SELECT * FROM users WHERE username=?",
        [userName]
      );
      if (!user) {
        Alert.alert("Error", "User does not exist !");
        return;
      }
      const validUser = await db.getFirstAsync(
        "SELECT * FROM users WHERE username=? AND password=?",
        [userName, password]
      );
      if (validUser) {
        Alert.alert("Success", "Login successful");
        navigation.navigate("Home", { user: userName });
      } else {
        Alert.alert("Error", "Incorrect password");
      }
    } catch (error) {}
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable
        style={styles.link}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </Pressable>
    </View>
  );
};

const RegisterScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (
      username.length == 0 ||
      password.length == 0 ||
      confirmPassword.length == 0
    ) {
      Alert.alert("Attention", "Please enter all fields");
      return;
    }
    if (password != confirmPassword) {
      Alert.alert("Attention", "Password did not matched");
      return;
    }
    try {
      const existingUser = await db.getFirstAsync(
        "SELECT * FROM users WHERE username=?",
        [username]
      );
      if (existingUser) {
        Alert.alert("Error", "User  Already exists");
        return;
      }

      await db.runAsync("INSERT INTO users(username, password) VALUES (?,?)", [
        username,
        password,
      ]);
      Alert.alert("Success", "Registration successful");
      navigation.navigate("Home", { user: username });
    } catch (error) {}
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      ></TextInput>
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
      <Pressable
        style={styles.link}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </Pressable>
    </View>
  );
};

const HomeScreen = ({ navigation, route }) => {
  const { user } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.label}>Welcome {user} </Text>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
  },
  input: {
    width: "80%",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    marginVertical: 5,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    marginVertical: 10,
    width: "80%",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  link: { marginTop: 10 },
  linkText: { color: "blue" },

  label: { fontSize: 18 },
});
