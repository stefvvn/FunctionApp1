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

    const newTask = {
      id: Date.now(),
      title: titleInput,
      body: bodyInput,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
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
          ? {
              ...task,
              title: titleInput,
              body: bodyInput,
              updatedAt: new Date().toISOString(),
            }
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

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const aLatest = new Date(a.updatedAt) > new Date(a.createdAt) ? a.updatedAt : a.createdAt;
    const bLatest = new Date(b.updatedAt) > new Date(b.createdAt) ? b.updatedAt : b.createdAt;
    return new Date(bLatest) - new Date(aLatest);
  });

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
            plugins: ["link", "lists", "autolink", "table", "insertdatetime"],
            toolbar:
              "undo redo | bold italic underline strikethrough| bullist numlist table | backcolor insertdatetime link",
          }}
        />
        {editingTask ? (
          <button onClick={handleUpdateTask}>Update</button>
        ) : (
          <button onClick={handleAddTask}>Add</button>
        )}
      </div>
      <div className="todo-cards">
        {sortedTasks.map((task) => (
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
            <div className="todo-timestamp">
              {task.createdAt !== task.updatedAt ? (
                <span>Edited on {formatTimestamp(task.updatedAt)}</span>
              ) : (
                <span>Created on {formatTimestamp(task.createdAt)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToDoApp;
