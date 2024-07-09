import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    calculateTotal();
    saveExpenses();
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("@expenses");
      if (jsonValue != null) {
        setExpenses(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Failed to load expenses:", e);
    }
  };

  const saveExpenses = async () => {
    try {
      const jsonValue = JSON.stringify(expenses);
      await AsyncStorage.setItem("@expenses", jsonValue);
    } catch (e) {
      console.error("Failed to save expenses:", e);
    }
  };

  const calculateTotal = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpenses(total);
  };

  const addOrUpdateExpense = () => {
    if (description && amount && category) {
      const newExpense = {
        id: editingId || Date.now().toString(),
        description,
        amount: parseFloat(amount),
        category,
        date: date.toISOString(),
      };

      if (editingId) {
        setExpenses(
          expenses.map((expense) =>
            expense.id === editingId ? newExpense : expense
          )
        );
        setEditingId(null);
      } else {
        setExpenses([...expenses, newExpense]);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date());
  };

  const editExpense = (id) => {
    const expenseToEdit = expenses.find((expense) => expense.id === id);
    setDescription(expenseToEdit.description);
    setAmount(expenseToEdit.amount.toString());
    setCategory(expenseToEdit.category);
    setDate(new Date(expenseToEdit.date));
    setEditingId(id);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const viewAsyncStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("@expenses");
      if (jsonValue !== null) {
        console.log("AsyncStorage contents:", JSON.parse(jsonValue));
        // You could also display this in an alert or on the screen
        alert("Check console for AsyncStorage contents");
      } else {
        console.log("AsyncStorage is empty");
        alert("AsyncStorage is empty");
      }
    } catch (e) {
      console.error("Failed to load AsyncStorage contents:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.selectedCategory,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>Date: {date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        <Button
          title={editingId ? "Update Expense" : "Add Expense"}
          onPress={addOrUpdateExpense}
        />
      </View>
      <Text style={styles.totalExpenses}>
        Total Expenses: ${totalExpenses.toFixed(2)}
      </Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <View>
              <Text style={styles.expenseDescription}>{item.description}</Text>
              <Text style={styles.expenseCategory}>{item.category}</Text>
              <Text style={styles.expenseDate}>
                {new Date(item.date).toDateString()}
              </Text>
            </View>

            <View style={styles.expenseRight}>
              <Text style={styles.expenseAmount}>
                ${item.amount.toFixed(2)}
              </Text>
              <View style={styles.expenseButtons}>
                <TouchableOpacity onPress={() => editExpense(item.id)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      <Button title="View AsyncStorage" onPress={viewAsyncStorage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  categoryButton: {
    padding: 8,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: "#ddd",
  },
  selectedCategory: {
    backgroundColor: "#007AFF",
  },
  dateButton: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#ddd",
    borderRadius: 6,
  },
  totalExpenses: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: "bold",
  },
  expenseCategory: {
    fontSize: 14,
    color: "#666",
  },
  expenseDate: {
    fontSize: 12,
    color: "#999",
  },
  expenseRight: {
    alignItems: "flex-end",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  expenseButtons: {
    flexDirection: "row",
    marginTop: 5,
  },
  editButton: {
    color: "#007AFF",
    marginRight: 10,
  },
  deleteButton: {
    color: "#FF3B30",
  },
});
