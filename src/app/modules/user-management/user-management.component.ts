import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  userForm: FormGroup;
  editingUser: User | null = null;
  showForm = false;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['user', Validators.required],
      active: [true],
      email: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.users = await this.authService.getAllUsers();
  }

  showAddForm() {
    this.editingUser = null;
    this.userForm.reset({ role: 'user', active: true });
    this.showForm = true;
  }

  editUser(user: User) {
    this.editingUser = user;
    this.userForm.patchValue({
      username: user.username,
      password: '', // don't show password
      role: user.role,
      active: user.active,
      email: user.email || ''
    });
    this.showForm = true;
  }

  cancelEdit() {
    this.showForm = false;
    this.editingUser = null;
  }

  async saveUser() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      try {
        if (this.editingUser) {
          await this.authService.updateUser(this.editingUser.id!, userData);
        } else {
          await this.authService.addUser(userData);
        }
        this.loadUsers();
        this.cancelEdit();
      } catch (error) {
        console.error('Error saving user:', error);
      }
    }
  }

  async toggleActive(user: User) {
    await this.authService.updateUser(user.id!, { active: !user.active });
    this.loadUsers();
  }

  async deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      await this.authService.deleteUser(user.id!);
      this.loadUsers();
    }
  }
}