import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./ToDoApp.css";
import apiUrls from "../service/apiUrl.js";

const ToDoApp = () => {
  const loadTasksFromLocalStorage = () => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  };

  const [tasks, setTasks] = useState(loadTasksFromLocalStorage);
  const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (titleInput.trim() === "" || bodyInput.trim() === "") return;

    setTasks([
      ...tasks,
      { id: Date.now(), title: titleInput, body: bodyInput, completed: false },
    ]);
    setTitleInput("");
    setBodyInput("");
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTitleInput(task.title);
    setBodyInput(task.body);
  };

  const handleUpdateTask = () => {
    setTasks(
      tasks.map((task) =>
        task.id === editingTask.id
          ? { ...task, title: titleInput, body: bodyInput }
          : task
      )
    );
    setEditingTask(null);
    setTitleInput("");
    setBodyInput("");
  };

  const handleToggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="todo-container">
      <h2>ToDo List</h2>
      <div className="todo-form">
        <input
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          placeholder="Enter task title"
        />
        <Editor
          apiKey={apiUrls.TINYMCE_API_KEY}
          value={bodyInput}
          onEditorChange={(content) => setBodyInput(content)}
          init={{
            height: 200,
            menubar: false,
            plugins: ["link", "lists", "autolink"],
            toolbar:
              "undo redo | bold italic underline | bullist numlist | link",
          }}
        />
        {editingTask ? (
          <button onClick={handleUpdateTask}>Update</button>
        ) : (
          <button onClick={handleAddTask}>Add</button>
        )}
      </div>
      <div className="todo-cards">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`todo-card ${task.completed ? "completed" : ""}`}
          >
            <h3 onClick={() => handleToggleComplete(task.id)}>{task.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: task.body }}></div>
            <div className="todo-actions">
              <button onClick={() => handleEditTask(task)}>Edit</button>
              <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToDoApp;
