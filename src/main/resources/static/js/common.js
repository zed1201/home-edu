// 公共工具函数
const API_BASE_URL = '';

// 本地存储工具
const Storage = {
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    removeUser: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // 同时清除token
    },
    isLoggedIn: () => {
        return Storage.getUser() !== null;
    },
    setToken: (token) => {
        localStorage.setItem('token', token);
    },
    getToken: () => {
        return localStorage.getItem('token');
    },
    removeToken: () => {
        localStorage.removeItem('token');
    }
};

// HTTP请求工具
const Http = {
    async request(url, options = {}) {
        const user = Storage.getUser();
        const token = Storage.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // 始终发送User-Id头（后端API需要）
        if (user && user.userId) {
            headers['User-Id'] = user.userId;
        }
        
        // 同时发送Bearer token作为备用认证方式
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(API_BASE_URL + url, {
                ...options,
                headers
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    },

    async get(url, options = {}) {
        return this.request(url, { method: 'GET', ...options });
    },

    async post(url, data, options = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    },

    async put(url, data, options = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    }
};

// 通知工具
const Toast = {
    show(message, type = 'info') {
        // 移除现有通知
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement('div');
        toast.className = `alert alert-${type} toast`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            min-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        // 3秒后自动移除
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    info(message) {
        this.show(message, 'info');
    }
};

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 页面工具
const Page = {
    redirect(url) {
        window.location.href = url;
    },

    requireAuth() {
        if (!Storage.isLoggedIn()) {
            this.redirect('/');
            return false;
        }
        return true;
    },

    requireRole(requiredRole) {
        const user = Storage.getUser();
        if (!user || user.role !== requiredRole) {
            Toast.error('权限不足');
            this.redirect('/');
            return false;
        }
        return true;
    },

    logout() {
        Storage.removeUser();
        Storage.removeToken();
        Toast.info('已退出登录');
        this.redirect('/');
    }
};

// 日期格式化工具
const DateUtil = {
    format(date, pattern = 'YYYY-MM-DD HH:mm') {
        if (!date) return '';
        
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return pattern
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    fromNow(date) {
        if (!date) return '';
        
        const now = new Date();
        const d = new Date(date);
        const diff = d.getTime() - now.getTime();
        
        if (diff < 0) {
            return '已过期';
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
            return `${days}天后到期`;
        } else if (hours > 0) {
            return `${hours}小时后到期`;
        } else {
            return '即将到期';
        }
    }
};

// 表单验证工具
const Validator = {
    required(value, message = '此字段为必填项') {
        return value && value.trim() ? null : message;
    },

    minLength(value, min, message) {
        return value && value.length >= min ? null : (message || `最少需要${min}个字符`);
    },

    maxLength(value, max, message) {
        return value && value.length <= max ? null : (message || `最多允许${max}个字符`);
    },

    number(value, message = '请输入有效数字') {
        return !isNaN(value) && value !== '' ? null : message;
    },

    min(value, min, message) {
        return Number(value) >= min ? null : (message || `最小值为${min}`);
    }
};

// 加载状态管理
const Loading = {
    show(container = document.body) {
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = '<div class="spinner"></div>';
        loading.id = 'loading-spinner';
        container.appendChild(loading);
    },

    hide() {
        const loading = document.getElementById('loading-spinner');
        if (loading) {
            loading.remove();
        }
    }
};

// 初始化导航栏
function initNavbar() {
    const user = Storage.getUser();
    if (!user) return;

    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const userInfo = navbar.querySelector('.user-info');
    if (userInfo) {
        // 尝试多个可能的用户名字段
        const displayName = user.realName || user.name || user.username || '用户';
        userInfo.innerHTML = `
            <span>欢迎，${displayName}！</span>
            <button class="btn btn-secondary" onclick="Page.logout()">退出</button>
        `;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
}); 