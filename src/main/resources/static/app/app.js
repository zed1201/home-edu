const { createApp, reactive, ref, computed, onMounted, watch } = Vue;
const { createRouter, createWebHashHistory, useRoute, useRouter } = VueRouter;

const Storage = {
  setUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  },
  getUser() {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (err) {
      return null;
    }
  },
  removeUser() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },
  setToken(token) {
    if (token) {
      localStorage.setItem("token", token);
    }
  },
  getToken() {
    return localStorage.getItem("token");
  },
  removeToken() {
    localStorage.removeItem("token");
  }
};

const store = reactive({
  user: Storage.getUser(),
  toasts: [],
  historyPoints: 0,
  historyBadge: null
});

const loading = reactive({ count: 0 });

function startLoading() {
  loading.count += 1;
}

function stopLoading() {
  loading.count = Math.max(0, loading.count - 1);
}

let toastId = 0;
function notify(type, message) {
  const id = ++toastId;
  store.toasts.push({ id, type, message });
  setTimeout(() => {
    const index = store.toasts.findIndex((toast) => toast.id === id);
    if (index >= 0) {
      store.toasts.splice(index, 1);
    }
  }, 3200);
}

const api = {
  async request(url, options = {}) {
    const user = Storage.getUser();
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (user && user.userId && !headers["User-Id"]) {
      headers["User-Id"] = user.userId;
    }

    const token = Storage.getToken();
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    return data;
  },
  get(url, options = {}) {
    return this.request(url, { method: "GET", ...options });
  },
  post(url, data, options = {}) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data || {}),
      ...options
    });
  },
  put(url, data, options = {}) {
    const body = data === undefined ? undefined : JSON.stringify(data);
    return this.request(url, {
      method: "PUT",
      body,
      ...options
    });
  }
};

function formatDate(value, pattern = "YYYY-MM-DD HH:mm") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return pattern
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes);
}

function pickDate(record, keys) {
  if (!record) return null;
  for (const key of keys) {
    if (record[key]) return record[key];
  }
  return null;
}

const taskStatusMap = {
  PUBLISHED: "已发布",
  IN_PROGRESS: "进行中",
  WAIT_CONFIRM: "待确认",
  DONE: "已完成",
  EXPIRED: "已过期"
};

const exchangeStatusMap = {
  PENDING: "待处理",
  CONFIRMED: "已确认",
  CANCELLED: "已取消"
};

const historyBadgeLevels = [
  {
    label: "卫星",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="#d9e4ff"/>
      <circle cx="12" cy="12" r="8" fill="none" stroke="rgba(49,215,255,0.7)" stroke-width="1.3" stroke-dasharray="2 3"/>
      <circle cx="18.5" cy="7.5" r="1.4" fill="#7ad7ff"/>
    </svg>`
  },
  {
    label: "行星",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5.2" fill="#3dd6ff"/>
      <circle cx="9.5" cy="10.5" r="1.6" fill="#7bffb2"/>
      <circle cx="14.8" cy="13.2" r="1" fill="#4bd6ff"/>
    </svg>`
  },
  {
    label: "大行星",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" fill="#ffb86b"/>
      <path d="M7 10.2h10" stroke="#f7e0c4" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M6.5 13.6h11" stroke="#f2c89a" stroke-width="1.4" stroke-linecap="round"/>
      <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="rgba(255,209,102,0.7)" stroke-width="1"/>
    </svg>`
  },
  {
    label: "太阳",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5.2" fill="#ffd166"/>
      <path d="M12 3.5v3" stroke="#ffd166" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M12 17.5v3" stroke="#ffd166" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M3.5 12h3" stroke="#ffd166" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M17.5 12h3" stroke="#ffd166" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    label: "红巨星",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" fill="#ff6b6b"/>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="rgba(255,90,111,0.6)" stroke-width="1.4"/>
    </svg>`
  },
  {
    label: "蓝巨星",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" fill="#5caeff"/>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="rgba(92,174,255,0.6)" stroke-width="1.4"/>
    </svg>`
  },
  {
    label: "红超巨星",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" fill="#ff4d6d"/>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="rgba(255,77,109,0.55)" stroke-width="1.4"/>
      <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(255,120,140,0.3)" stroke-width="1"/>
    </svg>`
  },
  {
    label: "蓝超巨星",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" fill="#4bb3ff"/>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="rgba(75,179,255,0.55)" stroke-width="1.4"/>
      <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(120,200,255,0.3)" stroke-width="1"/>
    </svg>`
  },
  {
    label: "史蒂文森218",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7" fill="#ff6a88"/>
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="rgba(255,106,136,0.5)" stroke-width="1.2" stroke-dasharray="3 3"/>
      <circle cx="17.5" cy="7" r="1.4" fill="#ffd6e0"/>
    </svg>`
  },
  {
    label: "室女座大星云",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="10" r="2" fill="#7ad7ff"/>
      <circle cx="14" cy="9" r="2.5" fill="#9be7ff"/>
      <circle cx="17" cy="14" r="1.8" fill="#5aa6ff"/>
      <circle cx="10" cy="15" r="1.6" fill="#ffd166"/>
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(124,190,255,0.5)" stroke-width="1"/>
    </svg>`
  },
  {
    label: "拉尼亚凯亚超星系团",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6.5" cy="12" r="2.1" fill="#7ad7ff"/>
      <circle cx="12" cy="8" r="2.6" fill="#ffd166"/>
      <circle cx="17.5" cy="13.5" r="2.2" fill="#ff6ad5"/>
      <path d="M7 12L12 8L17.5 13.5" stroke="rgba(255,255,255,0.5)" stroke-width="1" fill="none"/>
      <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(124,190,255,0.4)" stroke-width="1" stroke-dasharray="4 3"/>
    </svg>`
  },
  {
    label: "已知宇宙",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="rgba(124,190,255,0.6)" stroke-width="1.4"/>
      <circle cx="12" cy="12" r="4" fill="#5caeff"/>
      <path d="M4 12h16" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
      <path d="M12 4v16" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
    </svg>`
  },
  {
    label: "平行宇宙空间",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7" fill="none" stroke="rgba(49,215,255,0.7)" stroke-width="1.4"/>
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="rgba(255,106,213,0.7)" stroke-width="1.4"/>
      <path d="M7 7l10 10" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <path d="M17 7L7 17" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
    </svg>`
  }
].map((level, index) => ({
  ...level,
  min: Math.round(500 * (index * (index + 1) / 2))
}));

const levelList = historyBadgeLevels.map((level) => ({
  label: level.label,
  min: level.min,
  icon: level.icon
}));

function getHistoryBadge(points) {
  const value = Number(points) || 0;
  const sorted = historyBadgeLevels.slice().sort((a, b) => b.min - a.min);
  const current = sorted.find((level) => value >= level.min) || historyBadgeLevels[0];
  const next = sorted.find((level) => level.min > current.min);
  return {
    ...current,
    nextMin: next ? next.min : null
  };
}

async function refreshHistoryBadge() {
  if (!store.user || store.user.role !== "STUDENT") {
    store.historyPoints = 0;
    store.historyBadge = null;
    return;
  }
  try {
    const response = await api.get(`/api/user/${store.user.userId}`);
    if (response.code === 200 && response.data) {
      const points = Number(response.data.historyPoints) || 0;
      store.historyPoints = points;
      store.historyBadge = getHistoryBadge(points);
    }
  } catch (err) {
    // ignore network errors; keep existing badge
  }
}

function taskChipClass(status) {
  if (!status) return "published";
  return status.toLowerCase().replace("_", "-");
}

function exchangeChipClass(status) {
  if (!status) return "published";
  if (status === "CONFIRMED") return "done";
  if (status === "CANCELLED") return "cancelled";
  return "wait-confirm";
}

function setUser(user) {
  store.user = user;
  if (user) {
    Storage.setUser(user);
    if (user.role === "STUDENT") {
      refreshHistoryBadge();
    } else {
      store.historyPoints = 0;
      store.historyBadge = null;
    }
  }
}

function logout(router) {
  Storage.removeUser();
  Storage.removeToken();
  store.user = null;
  store.historyPoints = 0;
  store.historyBadge = null;
  notify("info", "已退出登录");
  router.replace("/login");
}

const LoginPage = {
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const role = ref("STUDENT");
    const username = ref("");
    const password = ref("");

    const submit = async () => {
      if (!username.value || !password.value) {
        notify("error", "请填写用户名和密码");
        return;
      }
      startLoading();
      try {
        const response = await api.post("/api/user/login", {
          username: username.value,
          password: password.value
        });

        if (response.code === 200) {
          setUser(response.data);
          if (response.data && response.data.token) {
            Storage.setToken(response.data.token);
          }
          notify("success", "登录成功");
          const target = response.data && response.data.role === "PARENT"
            ? "/parent/dashboard"
            : "/student/dashboard";
          router.replace(target);
        } else {
          notify("error", response.message || "登录失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    return { role, username, password, submit };
  },
  template: `
    <div class="hero">
      <div class="hero-card reveal" style="--delay: 40">
        <div class="kicker">COSMIC GROWTH / STAR MAP</div>
        <h1>家庭教育星图任务系统</h1>
        <p>把任务变成星际航迹，积分就是能量补给。让孩子在宇宙感的成长路线中持续探索。</p>
        <div class="tag-row" style="margin-top: 18px;">
          <span class="badge">星际任务</span>
          <span class="badge">能量积分</span>
          <span class="badge">成长星图</span>
        </div>
      </div>
      <div class="login-panel reveal" style="--delay: 120">
        <div>
          <div class="section-title">欢迎回到宇宙站</div>
          <div class="subtle">请选择身份并登录系统</div>
        </div>
        <div class="login-tabs">
          <button class="login-tab" :class="{ active: role === 'STUDENT' }" @click="role = 'STUDENT'">学生登录</button>
          <button class="login-tab" :class="{ active: role === 'PARENT' }" @click="role = 'PARENT'">家长登录</button>
        </div>
        <div>
          <label class="label" for="username">用户名</label>
          <input id="username" v-model="username" class="input" placeholder="请输入用户名" autocomplete="username" />
        </div>
        <div>
          <label class="label" for="password">密码</label>
          <input id="password" v-model="password" type="password" class="input" placeholder="请输入密码" autocomplete="current-password" />
        </div>
        <button class="btn btn-primary" @click="submit">登录进入系统</button>
        <div class="subtle">示例账号：parent001 / student001，密码均为 123456</div>
      </div>
    </div>
  `
};

const ParentDashboard = {
  name: "ParentDashboard",
  setup() {
    const stats = reactive({
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      totalPrizes: 0
    });
    const students = ref([]);
    const recentTasks = ref([]);
    const pendingTasks = ref([]);
    const loadingState = reactive({
      stats: false,
      students: false,
      recent: false,
      pending: false
    });

    const loadStats = async () => {
      loadingState.stats = true;
      try {
        const [tasksResp, pendingResp, prizesResp] = await Promise.all([
          api.get("/api/tasks/my-created"),
          api.get("/api/tasks/pending-confirm"),
          api.get("/api/prizes/my-created")
        ]);

        const tasks = tasksResp.code === 200 ? tasksResp.data || [] : [];
        stats.totalTasks = tasks.length;
        stats.completedTasks = tasks.filter((task) => task.status === "DONE").length;
        stats.pendingTasks = pendingResp.code === 200 ? (pendingResp.data || []).length : 0;
        stats.totalPrizes = prizesResp.code === 200 ? (prizesResp.data || []).length : 0;
      } catch (err) {
        notify("error", "加载统计失败");
      } finally {
        loadingState.stats = false;
      }
    };

    const loadStudents = async () => {
      loadingState.students = true;
      try {
        const user = store.user;
        if (!user) return;
        const response = await api.get(`/api/user/${user.userId}/students`);
        const list = response.code === 200 ? response.data || [] : [];
        const enriched = await Promise.all(
          list.map(async (student) => {
            try {
              const pointsResp = await api.get("/api/points/current", {
                headers: { "User-Id": student.id }
              });
              return {
                ...student,
                points: pointsResp.code === 200 ? pointsResp.data : 0
              };
            } catch (err) {
              return { ...student, points: 0 };
            }
          })
        );
        students.value = enriched;
      } catch (err) {
        students.value = [];
      } finally {
        loadingState.students = false;
      }
    };

    const loadRecentTasks = async () => {
      loadingState.recent = true;
      try {
        const response = await api.get("/api/tasks/my-created");
        if (response.code === 200) {
          const tasks = response.data || [];
          recentTasks.value = tasks
            .slice()
            .sort((a, b) => new Date(pickDate(b, ["createdAt", "createTime"]) || 0) - new Date(pickDate(a, ["createdAt", "createTime"]) || 0))
            .slice(0, 5);
        } else {
          recentTasks.value = [];
        }
      } catch (err) {
        recentTasks.value = [];
      } finally {
        loadingState.recent = false;
      }
    };

    const loadPending = async () => {
      loadingState.pending = true;
      try {
        const response = await api.get("/api/tasks/pending-confirm");
        pendingTasks.value = response.code === 200 ? response.data || [] : [];
      } catch (err) {
        pendingTasks.value = [];
      } finally {
        loadingState.pending = false;
      }
    };

    const confirmTask = async (taskId, isCompleted) => {
      startLoading();
      try {
        const response = await api.put(`/api/tasks/${taskId}/confirm`, {
          isCompleted,
          finalPoint: null
        });
        if (response.code === 200) {
          notify("success", isCompleted ? "任务确认完成" : "任务已要求重新完成");
          await Promise.all([loadStats(), loadPending(), loadRecentTasks()]);
        } else {
          notify("error", response.message || "操作失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    onMounted(async () => {
      await Promise.all([loadStats(), loadStudents(), loadRecentTasks(), loadPending()]);
    });

    return {
      store,
      stats,
      students,
      recentTasks,
      pendingTasks,
      loadingState,
      confirmTask,
      taskStatusMap,
      taskChipClass,
      formatDate
    };
  },
  template: `
    <div class="grid" style="gap: 24px;">
      <div class="panel reveal" style="--delay: 40">
        <div class="panel-header">
          <div>
            <div class="section-title">欢迎回来，{{ store.user?.realName || store.user?.username }}</div>
            <div class="subtle">掌控任务节奏，追踪孩子成长轨迹。</div>
          </div>
          <div class="badge">家长视图</div>
        </div>
      </div>

      <div class="grid grid-4">
        <div class="stat-card reveal" style="--delay: 80">
          <div class="stat-value">{{ stats.totalTasks }}</div>
          <div class="stat-label">发布任务总数</div>
        </div>
        <div class="stat-card reveal" style="--delay: 120">
          <div class="stat-value">{{ stats.pendingTasks }}</div>
          <div class="stat-label">待确认任务</div>
        </div>
        <div class="stat-card reveal" style="--delay: 160">
          <div class="stat-value">{{ stats.completedTasks }}</div>
          <div class="stat-label">已完成任务</div>
        </div>
        <div class="stat-card reveal" style="--delay: 200">
          <div class="stat-value">{{ stats.totalPrizes }}</div>
          <div class="stat-label">奖品总数</div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 110">
        <div class="panel-header">
          <h3 class="panel-title">快速操作</h3>
          <div class="subtle">快速进入核心功能</div>
        </div>
        <div class="tag-row">
          <router-link class="btn btn-primary" to="/parent/tasks/create">发布新任务</router-link>
          <router-link class="btn btn-ghost" to="/parent/tasks">管理任务</router-link>
          <router-link class="btn btn-warning" to="/parent/prizes">创建奖品</router-link>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 120">
        <div class="panel-header">
          <h3 class="panel-title">我的学生积分</h3>
          <div class="subtle">实时查看绑定学生积分</div>
        </div>
        <div v-if="loadingState.students" class="item-card">加载中...</div>
        <div v-else-if="students.length === 0" class="item-card">暂无绑定学生</div>
        <div v-else class="card-list">
          <div v-for="(student, index) in students" :key="student.id" class="item-card reveal" :style="{ '--delay': 60 + index * 60 }">
            <div class="item-header">
              <div class="item-title">{{ student.realName || student.username }}</div>
              <div class="badge">{{ student.points }} 积分</div>
            </div>
            <div class="item-meta">
              <span>用户名：{{ student.username }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 140">
        <div class="panel-header">
          <h3 class="panel-title">最近任务动态</h3>
          <div class="subtle">最新发布的任务</div>
        </div>
        <div v-if="loadingState.recent" class="item-card">加载中...</div>
        <div v-else-if="recentTasks.length === 0" class="item-card">暂无任务</div>
        <div v-else class="card-list">
          <div v-for="(task, index) in recentTasks" :key="task.id" class="item-card reveal" :style="{ '--delay': 80 + index * 60 }">
            <div class="item-header">
              <div class="item-title">{{ task.title }}</div>
              <span class="chip" :class="taskChipClass(task.status)">{{ taskStatusMap[task.status] || task.status }}</span>
            </div>
            <div class="subtle">{{ task.description || '暂无描述' }}</div>
            <div class="item-meta">
              <span>截止：{{ formatDate(task.deadline) }}</span>
              <span>积分：{{ task.point }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 160">
        <div class="panel-header">
          <h3 class="panel-title">待确认任务</h3>
          <div class="subtle">快速确认孩子提交</div>
        </div>
        <div v-if="loadingState.pending" class="item-card">加载中...</div>
        <div v-else-if="pendingTasks.length === 0" class="item-card">暂无待确认任务</div>
        <div v-else class="card-list">
          <div v-for="(task, index) in pendingTasks" :key="task.id" class="item-card reveal" :style="{ '--delay': 100 + index * 60 }">
            <div class="item-header">
              <div class="item-title">{{ task.title }}</div>
              <div class="badge">{{ task.point }} 积分</div>
            </div>
            <div class="subtle">{{ task.description || '暂无描述' }}</div>
            <div class="tag-row">
              <button class="btn btn-success btn-sm" @click="confirmTask(task.id, true)">确认完成</button>
              <button class="btn btn-danger btn-sm" @click="confirmTask(task.id, false)">重新完成</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

const ParentTaskCreate = {
  name: "ParentTaskCreate",
  setup() {
    const router = useRouter();
    const form = reactive({
      title: "",
      description: "",
      point: 10,
      deadline: ""
    });

    const templates = [
      {
        key: "homework",
        title: "完成作业",
        description: "认真完成当天所有科目作业，保证质量。",
        point: 15
      },
      {
        key: "housework",
        title: "家务劳动",
        description: "帮助家里做家务，保持整洁。",
        point: 10
      },
      {
        key: "reading",
        title: "阅读学习",
        description: "阅读指定书籍不少于30分钟，并分享心得。",
        point: 12
      },
      {
        key: "exercise",
        title: "体育锻炼",
        description: "完成30分钟以上的运动训练。",
        point: 8
      }
    ];

    const applyTemplate = (tpl) => {
      form.title = tpl.title;
      form.description = tpl.description;
      form.point = tpl.point;
      notify("info", `已应用模板：${tpl.title}`);
    };

    const resetForm = () => {
      form.title = "";
      form.description = "";
      form.point = 10;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      form.deadline = tomorrow.toISOString().slice(0, 16);
    };

    const submit = async () => {
      if (!form.title.trim()) {
        notify("error", "请输入任务标题");
        return;
      }
      if (!form.deadline) {
        notify("error", "请设置截止时间");
        return;
      }
      startLoading();
      try {
        const response = await api.post("/api/tasks", {
          title: form.title,
          description: form.description,
          point: Number(form.point),
          deadline: form.deadline
        });
        if (response.code === 200) {
          notify("success", "任务发布成功");
          router.push("/parent/tasks");
        } else {
          notify("error", response.message || "发布失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    onMounted(() => {
      resetForm();
    });

    return { form, templates, applyTemplate, resetForm, submit };
  },
  template: `
    <div class="grid" style="gap: 24px;">
      <div class="panel reveal" style="--delay: 40">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">发布新任务</h2>
            <div class="subtle">创建清晰的任务目标，驱动孩子主动完成。</div>
          </div>
        </div>
        <div class="form">
          <div>
            <label class="label">任务标题</label>
            <input class="input" v-model="form.title" placeholder="例如：完成数学作业" />
          </div>
          <div>
            <label class="label">任务描述</label>
            <textarea class="textarea" v-model="form.description" placeholder="详细描述任务要求"></textarea>
          </div>
          <div class="form-row">
            <div>
              <label class="label">奖励积分</label>
              <input class="input" type="number" min="1" max="1000" v-model="form.point" />
            </div>
            <div>
              <label class="label">截止时间</label>
              <input class="input" type="datetime-local" v-model="form.deadline" />
            </div>
          </div>
          <div>
            <div class="label">常用模板</div>
            <div class="tag-row">
              <button v-for="tpl in templates" :key="tpl.key" class="btn btn-ghost btn-sm" @click="applyTemplate(tpl)">
                {{ tpl.title }}
              </button>
            </div>
          </div>
          <div class="tag-row">
            <button class="btn btn-primary" @click="submit">发布任务</button>
            <button class="btn btn-ghost" @click="resetForm">重置</button>
          </div>
        </div>
      </div>
    </div>
  `
};

const ParentTaskList = {
  name: "ParentTaskList",
  setup() {
    const tasks = ref([]);
    const search = ref("");
    const statusFilter = ref("");
    const detailOpen = ref(false);
    const detailTask = ref(null);
    const assignments = ref([]);
    const loadingTasks = ref(false);

    const filteredTasks = computed(() => {
      const result = tasks.value.filter((task) => {
        const matchStatus = !statusFilter.value || task.status === statusFilter.value;
        const keyword = search.value.trim().toLowerCase();
        const matchKeyword = !keyword ||
          (task.title && task.title.toLowerCase().includes(keyword)) ||
          (task.description && task.description.toLowerCase().includes(keyword));
        return matchStatus && matchKeyword;
      });
      return result
        .slice()
        .sort(
          (a, b) =>
            new Date(pickDate(b, ["createdAt", "createTime"]) || 0) -
            new Date(pickDate(a, ["createdAt", "createTime"]) || 0)
        );
    });

    const stats = computed(() => {
      const all = tasks.value;
      return {
        total: all.length,
        pending: all.filter((task) => task.status === "WAIT_CONFIRM").length,
        done: all.filter((task) => task.status === "DONE").length,
        inProgress: all.filter((task) => task.status === "IN_PROGRESS").length
      };
    });

    const loadTasks = async () => {
      loadingTasks.value = true;
      try {
        const response = await api.get("/api/tasks/my-created");
        tasks.value = response.code === 200 ? response.data || [] : [];
      } catch (err) {
        tasks.value = [];
        notify("error", "加载任务失败");
      } finally {
        loadingTasks.value = false;
      }
    };

    const openDetail = async (task) => {
      detailTask.value = task;
      detailOpen.value = true;
      assignments.value = [];
      try {
        const response = await api.get(`/api/tasks/${task.id}/assignments`);
        assignments.value = response.code === 200 ? response.data || [] : [];
      } catch (err) {
        assignments.value = [];
      }
    };

    const closeDetail = () => {
      detailOpen.value = false;
      detailTask.value = null;
      assignments.value = [];
    };

    const confirmTask = async (taskId, isCompleted) => {
      startLoading();
      try {
        const response = await api.put(`/api/tasks/${taskId}/confirm`, {
          isCompleted,
          finalPoint: null
        });
        if (response.code === 200) {
          notify("success", isCompleted ? "任务确认完成" : "任务已要求重新完成");
          await loadTasks();
        } else {
          notify("error", response.message || "操作失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    onMounted(loadTasks);

    return {
      tasks,
      search,
      statusFilter,
      filteredTasks,
      stats,
      loadingTasks,
      loadTasks,
      openDetail,
      closeDetail,
      detailOpen,
      detailTask,
      assignments,
      confirmTask,
      taskStatusMap,
      taskChipClass,
      pickDate,
      formatDate
    };
  },
  template: `
    <div class="grid" style="gap: 24px;">
      <div class="panel reveal" style="--delay: 40">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">任务管理</h2>
            <div class="subtle">查看、筛选并确认任务完成情况。</div>
          </div>
          <router-link class="btn btn-primary" to="/parent/tasks/create">发布新任务</router-link>
        </div>
        <div class="form-row">
          <div>
            <label class="label">状态筛选</label>
            <select class="select" v-model="statusFilter">
              <option value="">全部状态</option>
              <option value="PUBLISHED">已发布</option>
              <option value="IN_PROGRESS">进行中</option>
              <option value="WAIT_CONFIRM">待确认</option>
              <option value="DONE">已完成</option>
            </select>
          </div>
          <div>
            <label class="label">搜索任务</label>
            <input class="input" v-model="search" placeholder="输入标题或描述" />
          </div>
          <div style="display: flex; align-items: flex-end;">
            <button class="btn btn-ghost" @click="loadTasks">刷新</button>
          </div>
        </div>
      </div>

      <div class="grid grid-4">
        <div class="stat-card reveal" style="--delay: 80">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总任务数</div>
        </div>
        <div class="stat-card reveal" style="--delay: 120">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待确认</div>
        </div>
        <div class="stat-card reveal" style="--delay: 160">
          <div class="stat-value">{{ stats.done }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-card reveal" style="--delay: 200">
          <div class="stat-value">{{ stats.inProgress }}</div>
          <div class="stat-label">进行中</div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 120">
        <div class="panel-header">
          <h3 class="panel-title">任务列表</h3>
          <div class="subtle">共 {{ filteredTasks.length }} 条</div>
        </div>
        <div v-if="loadingTasks" class="item-card">加载中...</div>
        <div v-else-if="filteredTasks.length === 0" class="item-card">暂无任务</div>
        <div v-else class="card-list">
          <div v-for="(task, index) in filteredTasks" :key="task.id" class="item-card reveal" :style="{ '--delay': 60 + index * 40 }">
            <div class="item-header">
              <div class="item-title">{{ task.title }}</div>
              <span class="chip" :class="taskChipClass(task.status)">{{ taskStatusMap[task.status] || task.status }}</span>
            </div>
            <div class="subtle">{{ task.description || '暂无描述' }}</div>
            <div class="item-meta">
              <span>截止：{{ formatDate(task.deadline) }}</span>
              <span>积分：{{ task.point }}</span>
              <span>创建：{{ formatDate(pickDate(task, ['createdAt', 'createTime'])) }}</span>
            </div>
            <div class="tag-row">
              <button class="btn btn-ghost btn-sm" @click="openDetail(task)">查看详情</button>
              <button v-if="task.status === 'WAIT_CONFIRM'" class="btn btn-success btn-sm" @click="confirmTask(task.id, true)">确认完成</button>
              <button v-if="task.status === 'WAIT_CONFIRM'" class="btn btn-danger btn-sm" @click="confirmTask(task.id, false)">重新完成</button>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="detailOpen" class="modal" @click.self="closeDetail">
          <div class="modal-card">
            <div class="panel-header">
              <h3 class="panel-title">任务详情</h3>
              <button class="btn btn-ghost btn-sm" @click="closeDetail">关闭</button>
            </div>
            <div v-if="detailTask">
              <div class="item-header" style="margin-bottom: 12px;">
                <div class="item-title">{{ detailTask.title }}</div>
                <span class="chip" :class="taskChipClass(detailTask.status)">{{ taskStatusMap[detailTask.status] || detailTask.status }}</span>
              </div>
              <div class="subtle" style="margin-bottom: 16px;">{{ detailTask.description || '暂无描述' }}</div>
              <div class="grid grid-2">
                <div class="item-card">积分：{{ detailTask.point }}</div>
                <div class="item-card">截止：{{ formatDate(detailTask.deadline) }}</div>
                <div class="item-card">创建：{{ formatDate(pickDate(detailTask, ['createdAt', 'createTime'])) }}</div>
                <div class="item-card">更新：{{ formatDate(pickDate(detailTask, ['updatedAt', 'updateTime'])) }}</div>
              </div>
              <div style="margin-top: 16px;">
                <div class="section-title">领取记录</div>
                <div v-if="assignments.length === 0" class="item-card">暂无学生领取</div>
                <div v-else class="card-list">
                  <div v-for="assign in assignments" :key="assign.id" class="item-card">
                    <div class="item-title">{{ assign.studentName }}</div>
                    <div class="item-meta">
                      <span>领取：{{ formatDate(assign.assignTime) }}</span>
                      <span v-if="assign.submitTime">提交：{{ formatDate(assign.submitTime) }}</span>
                    </div>
                    <div class="subtle" v-if="assign.submitContent">{{ assign.submitContent }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  `
};

const ParentPrizeManage = {
  name: "ParentPrizeManage",
  setup() {
    const prizes = ref([]);
    const exchanges = ref([]);
    const loadingPrizes = ref(false);
    const loadingExchanges = ref(false);
    const editOpen = ref(false);
    const editForm = reactive({
      id: null,
      name: "",
      description: "",
      costPoints: 20,
      stock: 1,
      expireAt: ""
    });
    const form = reactive({
      name: "",
      description: "",
      costPoints: 20,
      stock: 1,
      expireAt: ""
    });

    const templates = [
      { name: "玩具小汽车", description: "精美的遥控小汽车", costPoints: 50, stock: 2 },
      { name: "看电影票", description: "可以看一场电影", costPoints: 30, stock: 5 },
      { name: "零花钱10元", description: "额外零花钱奖励", costPoints: 20, stock: 10 },
      { name: "图书一本", description: "挑选喜欢的书", costPoints: 25, stock: 3 }
    ];

    const formatExpireAt = (dateStr) => {
      if (!dateStr) return null;
      return `${dateStr}T23:59:59`;
    };

    const loadPrizes = async () => {
      loadingPrizes.value = true;
      try {
        const response = await api.get("/api/prizes/my-created");
        prizes.value = response.code === 200 ? response.data || [] : [];
      } catch (err) {
        prizes.value = [];
      } finally {
        loadingPrizes.value = false;
      }
    };

    const loadExchanges = async () => {
      loadingExchanges.value = true;
      try {
        const response = await api.get("/api/prizes/exchanges/pending");
        exchanges.value = response.code === 200 ? response.data || [] : [];
      } catch (err) {
        exchanges.value = [];
      } finally {
        loadingExchanges.value = false;
      }
    };

    const submitPrize = async () => {
      if (!form.name.trim()) {
        notify("error", "请输入奖品名称");
        return;
      }
      startLoading();
      try {
        const response = await api.post("/api/prizes", {
          name: form.name,
          description: form.description,
          costPoints: Number(form.costPoints),
          stock: Number(form.stock),
          expireAt: formatExpireAt(form.expireAt)
        });
        if (response.code === 200) {
          notify("success", "奖品创建成功");
          form.name = "";
          form.description = "";
          form.costPoints = 20;
          form.stock = 1;
          form.expireAt = "";
          await loadPrizes();
        } else {
          notify("error", response.message || "创建失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    const applyTemplate = (tpl) => {
      form.name = tpl.name;
      form.description = tpl.description;
      form.costPoints = tpl.costPoints;
      form.stock = tpl.stock;
      notify("info", "已应用模板");
    };

    const openEdit = (prize) => {
      editForm.id = prize.id;
      editForm.name = prize.name;
      editForm.description = prize.description;
      editForm.costPoints = prize.costPoints;
      editForm.stock = prize.stock;
      editForm.expireAt = prize.expireAt ? formatDate(prize.expireAt, "YYYY-MM-DD") : "";
      editOpen.value = true;
    };

    const closeEdit = () => {
      editOpen.value = false;
      editForm.id = null;
    };

    const submitEdit = async () => {
      if (!editForm.id) return;
      startLoading();
      try {
        const response = await api.put(`/api/prizes/${editForm.id}`, {
          name: editForm.name,
          description: editForm.description,
          costPoints: Number(editForm.costPoints),
          stock: Number(editForm.stock),
          expireAt: formatExpireAt(editForm.expireAt)
        });
        if (response.code === 200) {
          notify("success", "奖品更新成功");
          closeEdit();
          await loadPrizes();
        } else {
          notify("error", response.message || "更新失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    const confirmExchange = async (exchangeId, confirmed) => {
      startLoading();
      try {
        const response = await api.put(`/api/prizes/exchanges/${exchangeId}/confirm?confirmed=${confirmed}`);
        if (response.code === 200) {
          notify("success", confirmed ? "兑换已确认" : "兑换已取消");
          await loadExchanges();
        } else {
          notify("error", response.message || "操作失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    onMounted(async () => {
      await Promise.all([loadPrizes(), loadExchanges()]);
    });

    return {
      prizes,
      exchanges,
      loadingPrizes,
      loadingExchanges,
      form,
      templates,
      submitPrize,
      loadPrizes,
      loadExchanges,
      applyTemplate,
      openEdit,
      closeEdit,
      editOpen,
      editForm,
      submitEdit,
      confirmExchange,
      exchangeStatusMap,
      exchangeChipClass,
      formatDate
    };
  },
  template: `
    <div class="grid" style="gap: 24px;">
      <div class="panel reveal" style="--delay: 40">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">奖品管理</h2>
            <div class="subtle">设置奖励清单，让积分更有驱动力。</div>
          </div>
        </div>
        <div class="form">
          <div>
            <label class="label">奖品名称</label>
            <input class="input" v-model="form.name" placeholder="例如：玩具小汽车" />
          </div>
          <div>
            <label class="label">奖品描述</label>
            <textarea class="textarea" v-model="form.description" placeholder="描述奖品亮点"></textarea>
          </div>
          <div class="form-row">
            <div>
              <label class="label">所需积分</label>
              <input class="input" type="number" min="1" max="1000" v-model="form.costPoints" />
            </div>
            <div>
              <label class="label">库存</label>
              <input class="input" type="number" min="1" max="100" v-model="form.stock" />
            </div>
            <div>
              <label class="label">有效期</label>
              <input class="input" type="date" v-model="form.expireAt" />
            </div>
          </div>
          <div>
            <div class="label">常用模板</div>
            <div class="tag-row">
              <button v-for="tpl in templates" :key="tpl.name" class="btn btn-ghost btn-sm" @click="applyTemplate(tpl)">
                {{ tpl.name }}
              </button>
            </div>
          </div>
          <div class="tag-row">
            <button class="btn btn-primary" @click="submitPrize">创建奖品</button>
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 120">
        <div class="panel-header">
          <h3 class="panel-title">我的奖品列表</h3>
          <button class="btn btn-ghost btn-sm" @click="loadPrizes">刷新</button>
        </div>
        <div v-if="loadingPrizes" class="item-card">加载中...</div>
        <div v-else-if="prizes.length === 0" class="item-card">暂无奖品</div>
        <div v-else class="card-list">
          <div v-for="(prize, index) in prizes" :key="prize.id" class="item-card reveal" :style="{ '--delay': 60 + index * 50 }">
            <div class="item-header">
              <div class="item-title">{{ prize.name }}</div>
              <div class="badge">{{ prize.costPoints }} 积分</div>
            </div>
            <div class="subtle">{{ prize.description || '暂无描述' }}</div>
            <div class="item-meta">
              <span>库存：{{ prize.stock }}</span>
              <span v-if="prize.expireAt">到期：{{ formatDate(prize.expireAt, 'YYYY-MM-DD') }}</span>
            </div>
            <div class="tag-row">
              <button class="btn btn-ghost btn-sm" @click="openEdit(prize)">编辑</button>
            </div>
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 140">
        <div class="panel-header">
          <h3 class="panel-title">待确认兑换</h3>
          <button class="btn btn-ghost btn-sm" @click="loadExchanges">刷新</button>
        </div>
        <div v-if="loadingExchanges" class="item-card">加载中...</div>
        <div v-else-if="exchanges.length === 0" class="item-card">暂无兑换请求</div>
        <div v-else class="card-list">
          <div v-for="(exchange, index) in exchanges" :key="exchange.id" class="item-card reveal" :style="{ '--delay': 80 + index * 50 }">
            <div class="item-header">
              <div class="item-title">{{ exchange.prizeName || '奖品' }}</div>
              <span class="chip" :class="exchangeChipClass(exchange.status)">{{ exchangeStatusMap[exchange.status] || exchange.status }}</span>
            </div>
            <div class="item-meta">
              <span>学生ID：{{ exchange.studentId }}</span>
              <span>积分：{{ exchange.costPoints }}</span>
              <span>申请：{{ formatDate(exchange.exchangedAt) }}</span>
            </div>
            <div class="tag-row">
              <button class="btn btn-success btn-sm" @click="confirmExchange(exchange.id, true)">确认</button>
              <button class="btn btn-danger btn-sm" @click="confirmExchange(exchange.id, false)">取消</button>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="editOpen" class="modal" @click.self="closeEdit">
          <div class="modal-card">
            <div class="panel-header">
              <h3 class="panel-title">编辑奖品</h3>
              <button class="btn btn-ghost btn-sm" @click="closeEdit">关闭</button>
            </div>
            <div class="form">
              <div>
                <label class="label">奖品名称</label>
                <input class="input" v-model="editForm.name" />
              </div>
              <div>
                <label class="label">奖品描述</label>
                <textarea class="textarea" v-model="editForm.description"></textarea>
              </div>
              <div class="form-row">
                <div>
                  <label class="label">所需积分</label>
                  <input class="input" type="number" v-model="editForm.costPoints" />
                </div>
                <div>
                  <label class="label">库存</label>
                  <input class="input" type="number" v-model="editForm.stock" />
                </div>
                <div>
                  <label class="label">有效期</label>
                  <input class="input" type="date" v-model="editForm.expireAt" />
                </div>
              </div>
              <div class="tag-row">
                <button class="btn btn-primary" @click="submitEdit">保存修改</button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  `
};

const StudentDashboard = {
  name: "StudentDashboard",
  setup() {
    const currentPoints = ref(0);
    const historyPoints = ref(0);
    const historyBadge = ref(getHistoryBadge(0));
    const stats = reactive({
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      earnedPoints: 0
    });
    const todayTasks = ref([]);
    const inProgressTasks = ref([]);
    const recentPoints = ref([]);
    const recommendedPrizes = ref([]);
    const loadingState = reactive({
      points: false,
      stats: false,
      today: false,
      progress: false,
      history: false,
      prizes: false
    });

    const loadCurrentPoints = async () => {
      loadingState.points = true;
      try {
        const response = await api.get("/api/points/current");
        currentPoints.value = response.code === 200 ? response.data || 0 : 0;
      } catch (err) {
        currentPoints.value = 0;
      } finally {
        loadingState.points = false;
      }
    };

    const loadStats = async () => {
      loadingState.stats = true;
      try {
        const [tasksResp, pointsResp, userResp] = await Promise.all([
          api.get("/api/tasks/my-assigned"),
          api.get("/api/points/logs"),
          store.user ? api.get(`/api/user/${store.user.userId}`) : Promise.resolve({ code: 500 })
        ]);
        const tasks = tasksResp.code === 200 ? tasksResp.data || [] : [];
        stats.totalTasks = tasks.length;
        stats.completedTasks = tasks.filter((task) => task.status === "DONE").length;
        stats.inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS" || task.status === "WAIT_CONFIRM").length;
        if (userResp.code === 200 && userResp.data) {
          const earned = Number(userResp.data.historyPoints) || 0;
          stats.earnedPoints = earned;
          historyPoints.value = earned;
          historyBadge.value = getHistoryBadge(earned);
          store.historyPoints = earned;
          store.historyBadge = historyBadge.value;
        } else if (pointsResp.code === 200) {
          const logs = pointsResp.data || [];
          const earned = logs.filter((log) => log.points > 0).reduce((sum, log) => sum + log.points, 0);
          stats.earnedPoints = earned;
          historyPoints.value = earned;
          historyBadge.value = getHistoryBadge(earned);
          store.historyPoints = earned;
          store.historyBadge = historyBadge.value;
        } else {
          stats.earnedPoints = 0;
          historyPoints.value = 0;
          historyBadge.value = getHistoryBadge(0);
          store.historyPoints = 0;
          store.historyBadge = historyBadge.value;
        }
      } catch (err) {
        stats.totalTasks = 0;
      } finally {
        loadingState.stats = false;
      }
    };

    const loadTodayTasks = async () => {
      loadingState.today = true;
      try {
        const response = await api.get("/api/tasks/available");
        const tasks = response.code === 200 ? response.data || [] : [];
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        todayTasks.value = tasks.filter((task) => {
          if (!task.deadline) return false;
          const deadline = new Date(task.deadline);
          return deadline >= now && deadline <= tomorrow;
        }).slice(0, 4);
      } catch (err) {
        todayTasks.value = [];
      } finally {
        loadingState.today = false;
      }
    };

    const loadInProgress = async () => {
      loadingState.progress = true;
      try {
        const response = await api.get("/api/tasks/my-assigned");
        if (response.code === 200) {
          inProgressTasks.value = (response.data || []).filter((task) => task.status === "IN_PROGRESS").slice(0, 4);
        }
      } catch (err) {
        inProgressTasks.value = [];
      } finally {
        loadingState.progress = false;
      }
    };

    const loadRecentPoints = async () => {
      loadingState.history = true;
      try {
        const response = await api.get("/api/points/logs");
        recentPoints.value = response.code === 200 ? (response.data || []).slice(0, 5) : [];
      } catch (err) {
        recentPoints.value = [];
      } finally {
        loadingState.history = false;
      }
    };

    const loadPrizes = async () => {
      loadingState.prizes = true;
      try {
        const response = await api.get("/api/prizes/available");
        recommendedPrizes.value = response.code === 200 ? (response.data || []).slice(0, 4) : [];
      } catch (err) {
        recommendedPrizes.value = [];
      } finally {
        loadingState.prizes = false;
      }
    };

    const assignTask = async (taskId) => {
      startLoading();
      try {
        const response = await api.post(`/api/tasks/${taskId}/assign`);
        if (response.code === 200) {
          notify("success", "任务领取成功");
          await loadTodayTasks();
          await loadInProgress();
          await loadStats();
        } else {
          notify("error", response.message || "领取失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    const exchangePrize = async (prizeId) => {
      startLoading();
      try {
        const response = await api.post(`/api/prizes/${prizeId}/exchange`);
        if (response.code === 200) {
          notify("success", "兑换成功，等待确认");
          await loadCurrentPoints();
          await loadPrizes();
        } else {
          notify("error", response.message || "兑换失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    onMounted(async () => {
      await Promise.all([
        loadCurrentPoints(),
        loadStats(),
        loadTodayTasks(),
        loadInProgress(),
        loadRecentPoints(),
        loadPrizes()
      ]);
    });

    const remainingToNext = computed(() => {
      if (historyBadge.value.nextMin === null) return 0;
      return Math.max(0, historyBadge.value.nextMin - historyPoints.value);
    });

    return {
      store,
      currentPoints,
      historyPoints,
      historyBadge,
      remainingToNext,
      stats,
      todayTasks,
      inProgressTasks,
      recentPoints,
      recommendedPrizes,
      loadingState,
      assignTask,
      exchangePrize,
      taskStatusMap,
      taskChipClass,
      formatDate
    };
  },
  template: `
    <div class="grid" style="gap: 24px;">
      <div class="panel reveal" style="--delay: 40">
        <div class="panel-header">
          <div>
            <div class="section-title">欢迎回来，{{ store.user?.realName || store.user?.username }}</div>
            <div class="subtle">继续完成任务，解锁更多奖励。</div>
          </div>
          <div class="tag-row">
            <div class="badge">当前积分 {{ currentPoints }}</div>
            <div class="badge">历史积分 {{ historyPoints }}</div>
            <div class="badge">
              <span class="badge-icon" v-html="historyBadge.icon"></span>
              {{ historyBadge.label }}
            </div>
          </div>
          </div>
        <div v-if="historyBadge.nextMin !== null" class="subtle">
          距离下一等级还需 {{ remainingToNext }} 积分
        </div>
      </div>

      <div class="grid grid-4">
        <div class="stat-card reveal" style="--delay: 80">
          <div class="stat-value">{{ stats.totalTasks }}</div>
          <div class="stat-label">领取任务总数</div>
        </div>
        <div class="stat-card reveal" style="--delay: 120">
          <div class="stat-value">{{ stats.completedTasks }}</div>
          <div class="stat-label">已完成任务</div>
        </div>
        <div class="stat-card reveal" style="--delay: 160">
          <div class="stat-value">{{ stats.inProgressTasks }}</div>
          <div class="stat-label">进行中任务</div>
        </div>
        <div class="stat-card reveal" style="--delay: 200">
          <div class="stat-value">{{ stats.earnedPoints }}</div>
          <div class="stat-label">累计获得积分</div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 110">
        <div class="panel-header">
          <h3 class="panel-title">快速操作</h3>
          <div class="subtle">开始新的挑战或兑换奖励</div>
        </div>
        <div class="tag-row">
          <router-link class="btn btn-primary" to="/student/tasks/available">领取新任务</router-link>
          <router-link class="btn btn-ghost" to="/student/tasks">查看我的任务</router-link>
          <router-link class="btn btn-warning" to="/student/prizes">兑换奖品</router-link>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 120">
        <div class="panel-header">
          <h3 class="panel-title">今日可领取任务</h3>
          <router-link class="btn btn-ghost btn-sm" to="/student/tasks/available">查看更多</router-link>
        </div>
        <div v-if="loadingState.today" class="item-card">加载中...</div>
        <div v-else-if="todayTasks.length === 0" class="item-card">暂无即将截止的任务</div>
        <div v-else class="card-list">
          <div v-for="(task, index) in todayTasks" :key="task.id" class="item-card reveal" :style="{ '--delay': 60 + index * 50 }">
            <div class="item-header">
              <div class="item-title">{{ task.title }}</div>
              <div class="badge">{{ task.point }} 积分</div>
            </div>
            <div class="item-meta">
              <span>截止：{{ formatDate(task.deadline) }}</span>
            </div>
            <button class="btn btn-primary btn-sm" @click="assignTask(task.id)">立即领取</button>
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 140">
        <div class="panel-header">
          <h3 class="panel-title">进行中的任务</h3>
          <router-link class="btn btn-ghost btn-sm" to="/student/tasks">查看全部</router-link>
        </div>
        <div v-if="loadingState.progress" class="item-card">加载中...</div>
        <div v-else-if="inProgressTasks.length === 0" class="item-card">暂无进行中任务</div>
        <div v-else class="card-list">
          <div v-for="(task, index) in inProgressTasks" :key="task.id" class="item-card reveal" :style="{ '--delay': 70 + index * 50 }">
            <div class="item-header">
              <div class="item-title">{{ task.title }}</div>
              <span class="chip" :class="taskChipClass(task.status)">{{ taskStatusMap[task.status] || task.status }}</span>
            </div>
            <div class="item-meta">
              <span>截止：{{ formatDate(task.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 160">
        <div class="panel-header">
          <h3 class="panel-title">最近积分动态</h3>
          <div class="subtle">最近 5 条记录</div>
        </div>
        <div v-if="loadingState.history" class="item-card">加载中...</div>
        <div v-else-if="recentPoints.length === 0" class="item-card">暂无积分记录</div>
        <div v-else class="card-list">
          <div v-for="(log, index) in recentPoints" :key="log.id" class="item-card reveal" :style="{ '--delay': 80 + index * 40 }">
            <div class="item-header">
              <div class="item-title">{{ log.description || '积分变动' }}</div>
              <div class="badge">{{ log.points > 0 ? '+' : '' }}{{ log.points }}</div>
            </div>
            <div class="item-meta">
              <span>{{ formatDate(log.createdAt) }}</span>
              <span>{{ log.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 180">
        <div class="panel-header">
          <h3 class="panel-title">推荐奖品</h3>
          <router-link class="btn btn-ghost btn-sm" to="/student/prizes">查看更多</router-link>
        </div>
        <div v-if="loadingState.prizes" class="item-card">加载中...</div>
        <div v-else-if="recommendedPrizes.length === 0" class="item-card">暂无可兑换奖品</div>
        <div v-else class="card-list">
          <div v-for="(prize, index) in recommendedPrizes" :key="prize.id" class="item-card reveal" :style="{ '--delay': 90 + index * 40 }">
            <div class="item-header">
              <div class="item-title">{{ prize.name }}</div>
              <div class="badge">{{ prize.costPoints }} 积分</div>
            </div>
            <div class="subtle">{{ prize.description || '暂无描述' }}</div>
            <button class="btn btn-warning btn-sm" @click="exchangePrize(prize.id)">兑换</button>
          </div>
        </div>
      </div>
    </div>
  `
};

const StudentAvailableTasks = {
  name: "StudentAvailableTasks",
  setup() {
    const tasks = ref([]);
    const loadingTasks = ref(false);
    const search = ref("");

    const filteredTasks = computed(() => {
      const keyword = search.value.trim().toLowerCase();
      if (!keyword) return tasks.value;
      return tasks.value.filter((task) =>
        (task.title && task.title.toLowerCase().includes(keyword)) ||
        (task.description && task.description.toLowerCase().includes(keyword))
      );
    });

    const loadTasks = async () => {
      loadingTasks.value = true;
      try {
        const response = await api.get("/api/tasks/available");
        tasks.value = response.code === 200 ? response.data || [] : [];
      } catch (err) {
        tasks.value = [];
      } finally {
        loadingTasks.value = false;
      }
    };

    const assignTask = async (taskId) => {
      startLoading();
      try {
        const response = await api.post(`/api/tasks/${taskId}/assign`);
        if (response.code === 200) {
          notify("success", "任务领取成功");
          await loadTasks();
        } else {
          notify("error", response.message || "领取失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    onMounted(loadTasks);

    return { tasks, loadingTasks, search, filteredTasks, loadTasks, assignTask, formatDate };
  },
  template: `
    <div class="grid" style="gap: 24px;">
      <div class="panel reveal" style="--delay: 40">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">可领取任务</h2>
            <div class="subtle">选择任务并开始挑战。</div>
          </div>
          <button class="btn btn-ghost btn-sm" @click="loadTasks">刷新</button>
        </div>
        <div class="form-row">
          <div>
            <label class="label">搜索任务</label>
            <input class="input" v-model="search" placeholder="输入标题或描述" />
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 120">
        <div v-if="loadingTasks" class="item-card">加载中...</div>
        <div v-else-if="filteredTasks.length === 0" class="item-card">暂无可领取任务</div>
        <div v-else class="card-list">
          <div v-for="(task, index) in filteredTasks" :key="task.id" class="item-card reveal" :style="{ '--delay': 60 + index * 50 }">
            <div class="item-header">
              <div class="item-title">{{ task.title }}</div>
              <div class="badge">{{ task.point }} 积分</div>
            </div>
            <div class="subtle">{{ task.description || '暂无描述' }}</div>
            <div class="item-meta">
              <span>截止：{{ formatDate(task.deadline) }}</span>
            </div>
            <button class="btn btn-primary btn-sm" @click="assignTask(task.id)">领取任务</button>
          </div>
        </div>
      </div>
    </div>
  `
};

const StudentMyTasks = {
  name: "StudentMyTasks",
  setup() {
    const tasks = ref([]);
    const loadingTasks = ref(false);
    const statusFilter = ref("");
    const search = ref("");
    const submitOpen = ref(false);
    const submitContent = ref("");
    const submitTaskId = ref(null);

    const filteredTasks = computed(() => {
      const keyword = search.value.trim().toLowerCase();
      return tasks.value.filter((task) => {
        const matchStatus = !statusFilter.value || task.status === statusFilter.value;
        const matchKeyword = !keyword ||
          (task.title && task.title.toLowerCase().includes(keyword)) ||
          (task.description && task.description.toLowerCase().includes(keyword));
        return matchStatus && matchKeyword;
      });
    });

    const loadTasks = async () => {
      loadingTasks.value = true;
      try {
        const response = await api.get("/api/tasks/my-assigned");
        tasks.value = response.code === 200 ? response.data || [] : [];
      } catch (err) {
        tasks.value = [];
      } finally {
        loadingTasks.value = false;
      }
    };

    const openSubmit = (taskId) => {
      submitTaskId.value = taskId;
      submitContent.value = "";
      submitOpen.value = true;
    };

    const closeSubmit = () => {
      submitOpen.value = false;
      submitTaskId.value = null;
    };

    const submitTask = async () => {
      if (!submitTaskId.value) return;
      if (!submitContent.value.trim()) {
        notify("error", "请填写完成说明");
        return;
      }
      startLoading();
      try {
        const response = await api.post(`/api/tasks/${submitTaskId.value}/submit`, {
          submitContent: submitContent.value
        });
        if (response.code === 200) {
          notify("success", "任务提交成功，等待家长确认");
          closeSubmit();
          await loadTasks();
        } else {
          notify("error", response.message || "提交失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    onMounted(loadTasks);

    return {
      tasks,
      loadingTasks,
      statusFilter,
      search,
      filteredTasks,
      loadTasks,
      submitOpen,
      openSubmit,
      closeSubmit,
      submitContent,
      submitTask,
      taskStatusMap,
      taskChipClass,
      formatDate
    };
  },
  template: `
    <div class="grid" style="gap: 24px;">
      <div class="panel reveal" style="--delay: 40">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">我的任务</h2>
            <div class="subtle">管理已领取任务。</div>
          </div>
          <router-link class="btn btn-primary" to="/student/tasks/available">领取新任务</router-link>
        </div>
        <div class="form-row">
          <div>
            <label class="label">状态筛选</label>
            <select class="select" v-model="statusFilter">
              <option value="">全部状态</option>
              <option value="IN_PROGRESS">进行中</option>
              <option value="WAIT_CONFIRM">待确认</option>
              <option value="DONE">已完成</option>
            </select>
          </div>
          <div>
            <label class="label">搜索任务</label>
            <input class="input" v-model="search" placeholder="输入标题或描述" />
          </div>
          <div style="display: flex; align-items: flex-end;">
            <button class="btn btn-ghost" @click="loadTasks">刷新</button>
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 120">
        <div v-if="loadingTasks" class="item-card">加载中...</div>
        <div v-else-if="filteredTasks.length === 0" class="item-card">暂无任务</div>
        <div v-else class="card-list">
          <div v-for="(task, index) in filteredTasks" :key="task.id" class="item-card reveal" :style="{ '--delay': 60 + index * 50 }">
            <div class="item-header">
              <div class="item-title">{{ task.title }}</div>
              <span class="chip" :class="taskChipClass(task.status)">{{ taskStatusMap[task.status] || task.status }}</span>
            </div>
            <div class="subtle">{{ task.description || '暂无描述' }}</div>
            <div class="item-meta">
              <span>截止：{{ formatDate(task.deadline) }}</span>
              <span>积分：{{ task.point }}</span>
            </div>
            <button v-if="task.status === 'IN_PROGRESS'" class="btn btn-success btn-sm" @click="openSubmit(task.id)">提交任务</button>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="submitOpen" class="modal" @click.self="closeSubmit">
          <div class="modal-card">
            <div class="panel-header">
              <h3 class="panel-title">提交任务</h3>
              <button class="btn btn-ghost btn-sm" @click="closeSubmit">关闭</button>
            </div>
            <div class="form">
              <div>
                <label class="label">完成说明</label>
                <textarea class="textarea" v-model="submitContent" placeholder="描述任务完成情况"></textarea>
              </div>
              <div class="tag-row">
                <button class="btn btn-primary" @click="submitTask">确认提交</button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  `
};

const StudentPrizes = {
  name: "StudentPrizes",
  setup() {
    const available = ref([]);
    const history = ref([]);
    const loadingAvailable = ref(false);
    const loadingHistory = ref(false);

    const loadAvailable = async () => {
      loadingAvailable.value = true;
      try {
        const response = await api.get("/api/prizes/available");
        available.value = response.code === 200 ? response.data || [] : [];
      } catch (err) {
        available.value = [];
      } finally {
        loadingAvailable.value = false;
      }
    };

    const loadHistory = async () => {
      loadingHistory.value = true;
      try {
        const response = await api.get("/api/prizes/exchanges/my");
        history.value = response.code === 200 ? response.data || [] : [];
      } catch (err) {
        history.value = [];
      } finally {
        loadingHistory.value = false;
      }
    };

    const exchangePrize = async (prizeId) => {
      startLoading();
      try {
        const response = await api.post(`/api/prizes/${prizeId}/exchange`);
        if (response.code === 200) {
          notify("success", "兑换成功，等待家长确认");
          await Promise.all([loadAvailable(), loadHistory()]);
        } else {
          notify("error", response.message || "兑换失败");
        }
      } catch (err) {
        notify("error", "网络错误，请稍后重试");
      } finally {
        stopLoading();
      }
    };

    onMounted(async () => {
      await Promise.all([loadAvailable(), loadHistory()]);
    });

    return {
      available,
      history,
      loadingAvailable,
      loadingHistory,
      loadAvailable,
      loadHistory,
      exchangePrize,
      exchangeStatusMap,
      exchangeChipClass,
      formatDate
    };
  },
  template: `
    <div class="grid" style="gap: 24px;">
      <div class="panel reveal" style="--delay: 40">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">奖品兑换</h2>
            <div class="subtle">选择心仪奖品，用积分兑换。</div>
          </div>
          <button class="btn btn-ghost btn-sm" @click="loadAvailable">刷新</button>
        </div>
        <div v-if="loadingAvailable" class="item-card">加载中...</div>
        <div v-else-if="available.length === 0" class="item-card">暂无可兑换奖品</div>
        <div v-else class="card-list">
          <div v-for="(prize, index) in available" :key="prize.id" class="item-card reveal" :style="{ '--delay': 60 + index * 50 }">
            <div class="item-header">
              <div class="item-title">{{ prize.name }}</div>
              <div class="badge">{{ prize.costPoints }} 积分</div>
            </div>
            <div class="subtle">{{ prize.description || '暂无描述' }}</div>
            <div class="item-meta">
              <span>库存：{{ prize.stock }}</span>
              <span v-if="prize.expireAt">到期：{{ formatDate(prize.expireAt, 'YYYY-MM-DD') }}</span>
            </div>
            <button class="btn btn-warning btn-sm" @click="exchangePrize(prize.id)">兑换</button>
          </div>
        </div>
      </div>

      <div class="panel reveal" style="--delay: 120">
        <div class="panel-header">
          <h3 class="panel-title">我的兑换记录</h3>
          <button class="btn btn-ghost btn-sm" @click="loadHistory">刷新</button>
        </div>
        <div v-if="loadingHistory" class="item-card">加载中...</div>
        <div v-else-if="history.length === 0" class="item-card">暂无兑换记录</div>
        <div v-else class="card-list">
          <div v-for="(record, index) in history" :key="record.id" class="item-card reveal" :style="{ '--delay': 80 + index * 40 }">
            <div class="item-header">
              <div class="item-title">{{ record.prizeName || '奖品' }}</div>
              <span class="chip" :class="exchangeChipClass(record.status)">{{ exchangeStatusMap[record.status] || record.status }}</span>
            </div>
            <div class="item-meta">
              <span>积分：{{ record.costPoints }}</span>
              <span>兑换：{{ formatDate(record.exchangedAt) }}</span>
              <span v-if="record.confirmedAt">确认：{{ formatDate(record.confirmedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage, meta: { hideNav: true } },
  { path: "/parent/dashboard", component: ParentDashboard, meta: { requiresAuth: true, role: "PARENT" } },
  { path: "/parent/tasks/create", component: ParentTaskCreate, meta: { requiresAuth: true, role: "PARENT" } },
  { path: "/parent/tasks", component: ParentTaskList, meta: { requiresAuth: true, role: "PARENT" } },
  { path: "/parent/prizes", component: ParentPrizeManage, meta: { requiresAuth: true, role: "PARENT" } },
  { path: "/student/dashboard", component: StudentDashboard, meta: { requiresAuth: true, role: "STUDENT" } },
  { path: "/student/tasks/available", component: StudentAvailableTasks, meta: { requiresAuth: true, role: "STUDENT" } },
  { path: "/student/tasks", component: StudentMyTasks, meta: { requiresAuth: true, role: "STUDENT" } },
  { path: "/student/prizes", component: StudentPrizes, meta: { requiresAuth: true, role: "STUDENT" } }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const user = Storage.getUser();
  if (to.meta && to.meta.requiresAuth) {
    if (!user) {
      next("/login");
      return;
    }
    if (to.meta.role && user.role !== to.meta.role) {
      const fallback = user.role === "PARENT" ? "/parent/dashboard" : "/student/dashboard";
      next(fallback);
      return;
    }
  }

  if (to.path === "/login" && user) {
    const fallback = user.role === "PARENT" ? "/parent/dashboard" : "/student/dashboard";
    next(fallback);
    return;
  }

  next();
});

const AppRoot = {
  name: "AppRoot",
  setup() {
    const route = useRoute();
    const routerInstance = useRouter();

    const links = computed(() => {
      if (!store.user) return [];
      if (store.user.role === "PARENT") {
        return [
          { label: "概览", to: "/parent/dashboard" },
          { label: "发布任务", to: "/parent/tasks/create" },
          { label: "任务管理", to: "/parent/tasks" },
          { label: "奖品管理", to: "/parent/prizes" }
        ];
      }
      return [
        { label: "概览", to: "/student/dashboard" },
        { label: "可领取任务", to: "/student/tasks/available" },
        { label: "我的任务", to: "/student/tasks" },
        { label: "奖品兑换", to: "/student/prizes" }
      ];
    });

    const showLevel = computed(() => store.user && store.user.role === "STUDENT");
    const levelInfo = computed(() => store.historyBadge || getHistoryBadge(store.historyPoints));
    const levelModalOpen = ref(false);
    const closeLevelModal = () => {
      levelModalOpen.value = false;
    };
    const openLevelModal = () => {
      levelModalOpen.value = true;
    };

    const handleLogout = () => logout(routerInstance);

    watch(
      () => (store.user ? store.user.userId : null),
      () => {
        refreshHistoryBadge();
      },
      { immediate: true }
    );

    return { route, links, handleLogout, store, loading, showLevel, levelInfo, levelModalOpen, openLevelModal, closeLevelModal, levelList };
  },
  template: `
    <div class="app-shell">
      <div class="orbiting-planet" aria-hidden="true"></div>
      <div class="supergiant-flare" aria-hidden="true"></div>
      <div class="supergiant-flare blue" aria-hidden="true"></div>
      <div class="comet comet-1" aria-hidden="true"></div>
      <div class="comet comet-2" aria-hidden="true"></div>
      <div class="comet comet-3" aria-hidden="true"></div>
      <div class="comet comet-4" aria-hidden="true"></div>
      <nav v-if="store.user && !route.meta.hideNav" class="navbar">
        <div class="nav-inner">
          <div class="nav-left">
            <div class="brand">
              <span class="brand-badge"></span>
              家庭教育系统
            </div>
            <button v-if="showLevel" class="level-pill" @click="openLevelModal" type="button">
              <span class="level-label">等级</span>
              <span class="level-name">{{ levelInfo.label }}</span>
              <span class="level-icon" v-html="levelInfo.icon"></span>
            </button>
          </div>
          <div class="nav-links">
            <router-link v-for="link in links" :key="link.to" :to="link.to">{{ link.label }}</router-link>
          </div>
          <div class="nav-actions">
            <div class="user-pill">
              <span>{{ store.user?.realName || store.user?.username }}</span>
              <span class="badge">{{ store.user?.role === 'PARENT' ? '家长' : '学生' }}</span>
            </div>
            <button class="btn btn-ghost btn-sm" @click="handleLogout">退出</button>
          </div>
        </div>
      </nav>

      <main class="layout">
        <router-view></router-view>
      </main>

      <transition name="fade">
        <div v-if="levelModalOpen" class="modal" @click.self="closeLevelModal">
          <div class="modal-card">
            <div class="panel-header">
              <h3 class="panel-title">等级说明</h3>
              <button class="btn btn-ghost btn-sm" @click="closeLevelModal">关闭</button>
            </div>
            <div class="subtle" style="margin-bottom: 12px;">历史积分达到以下值即可升级。</div>
            <div class="card-list">
              <div v-for="level in levelList" :key="level.label" class="item-card">
                <div class="item-header">
                  <div class="item-title">
                    <span class="badge-icon" v-html="level.icon"></span>
                    {{ level.label }}
                  </div>
                  <div class="badge">{{ level.min }} 积分</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <div class="toast-stack">
        <div v-for="toast in store.toasts" :key="toast.id" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </div>

      <div v-if="loading.count > 0" class="loading-mask">
        <div class="spinner"></div>
      </div>
    </div>
  `
};

const app = createApp(AppRoot);
app.config.globalProperties.store = store;
app.use(router);
app.mount("#app");
