import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // <-- Add this import
import { UserService } from './user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // <-- Add FormsModule here
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  userForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    role: ['', Validators.required]
  });
  editRole: { [key: string]: string } = {};
  message: string | null = null;

  constructor(private userService: UserService, private fb: FormBuilder) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        // Initialize editRole for each user
        users.forEach((user: any) => this.editRole[user.id] = user.role);
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

  updateRole(user: any) {
    const newRole = this.editRole[user.id];
    if (!newRole) return;
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.message = 'Role updated!';
        this.loadUsers();
      },
      error: () => this.message = 'Failed to update role.'
    });
  }

  deleteUser(user: any) {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.message = 'User deleted!';
        this.loadUsers();
      },
      error: () => this.message = 'Failed to delete user.'
    });
  }
}
