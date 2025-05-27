import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // <-- Add this import
import { UserService } from '../user.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule], // <-- Add FormsModule here
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  userForm: any;
  editRole: { [key: string]: string } = {};
  message: string | null = null;
  editUserId: string | null = null;
  editUserData: any = {};

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        // Initialize the dropdown value for each user from DB
        users.forEach((user: any) => this.editUserData[user.id] = user.role);
      },
      error: () => this.message = 'Failed to load users.'
    });
  }

  addUser() {
    if (this.userForm.invalid) return;
    this.userService.addUser(this.userForm.value).subscribe({
      next: () => {
        this.message = 'User added!';
        this.userForm.reset();
        this.loadUsers();
      },
      error: () => this.message = 'Failed to add user.'
    });
  }

  // updateRole(user: any) {
  //   const newRole = this.editRole[user.id];
  //   if (!newRole) return;
  //   this.userService.updateUserRole(user.id, newRole).subscribe({
  //     next: () => {
  //       this.message = 'Role updated!';
  //       this.loadUsers();
  //     },
  //     error: () => this.message = 'Failed to update role.'
  //   });
  // }

  deleteUser(user: any) {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.message = 'User deleted!';
        this.loadUsers();
      },
      error: () => this.message = 'Failed to delete user.'
    });
  }

  startEdit(user: any) {
    this.editUserId = user.id;
    this.editUserData[user.id] = user.role; // Ensure dropdown is initialized
  }

  updateUser(user: any) {
    const updatedRole = this.editUserData[user.id];
    const payload = {
      username: user.username,
      role: updatedRole
    };
    this.userService.updateUser(user.id, payload).subscribe({
      next: () => {
        this.message = 'User updated!';
        this.editUserId = null;
        this.loadUsers();
      },
      error: () => this.message = 'Failed to update user.'
    });
  }
}
