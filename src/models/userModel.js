import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const User = sequelize.define(
  "User",
  {
    userID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "userID",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: "email",
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "display_name",
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },
    role: {
      type: DataTypes.ENUM("host", "member"),
      allowNull: false,
      defaultValue: "member",
      field: "role",
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "avatar",
    },
  },
  {
    tableName: "Users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
