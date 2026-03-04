/**
 * React Query Usage Examples
 * 
 * Complete examples showing how to use the API hooks in your components.
 */

'use client';

import { useState } from 'react';
import {
  useRegister,
  useLogin,
  useLogout,
  useCurrentUser,
  useSites,
  useSite,
  useCreateSite,
  useUpdateSite,
  useDeleteSite,
  useMetrics,
  useMetricsSummary,
  useAlerts,
  useCreateAlert,
  useUpdateAlert,
  useDeleteAlert,
} from './react-query-hooks';
import { getErrorMessage } from './react-query-client';

// ============================================================================
// Authentication Examples
// ============================================================================

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const login = useLogin({
    onSuccess: (data) => {
      console.log('Login successful:', data.user);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      alert(`Login failed: ${getErrorMessage(error)}`);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  
  const register = useRegister({
    onSuccess: (data) => {
      console.log('Registration successful:', data.user);
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      alert(`Registration failed: ${getErrorMessage(error)}`);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <input
        type="text"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        placeholder="First Name"
      />
      <input
        type="text"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        placeholder="Last Name"
      />
      <button type="submit" disabled={register.isPending}>
        {register.isPending ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}

export function UserProfile() {
  const { data, isLoading, error } = useCurrentUser();
  const logout = useLogout();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {getErrorMessage(error)}</div>;
  if (!data) return null;
  
  return (
    <div>
      <h2>Welcome, {data.user.firstName || data.user.email}!</h2>
      <p>Email: {data.user.email}</p>
      <button onClick={() => logout.mutate()}>Logout</button>
    </div>
  );
}

// ============================================================================
// Site Management Examples
// ============================================================================

export function SitesList() {
  const { data, isLoading, error } = useSites();
  const deleteSite = useDeleteSite({
    onSuccess: () => {
      alert('Site deleted successfully');
    },
  });
  
  if (isLoading) return <div>Loading sites...</div>;
  if (error) return <div>Error: {getErrorMessage(error)}</div>;
  if (!data) return null;
  
  return (
    <div>
      <h2>My Sites</h2>
      {data.sites.length === 0 ? (
        <p>No sites yet. Create your first site!</p>
      ) : (
        <ul>
          {data.sites.map((site) => (
            <li key={site.id}>
              <h3>{site.name}</h3>
              <p>{site.url}</p>
              <p>Status: {site.isActive ? 'Active' : 'Inactive'}</p>
              <button onClick={() => deleteSite.mutate(site.siteId)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CreateSiteForm() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  
  const createSite = useCreateSite({
    onSuccess: (data) => {
      alert(`Site created: ${data.site.name}`);
      setName('');
      setUrl('');
    },
    onError: (error) => {
      alert(`Failed to create site: ${getErrorMessage(error)}`);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSite.mutate({ name, url });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Site Name"
        required
      />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        required
      />
      <button type="submit" disabled={createSite.isPending}>
        {createSite.isPending ? 'Creating...' : 'Create Site'}
      </button>
    </form>
  );
}

export function SiteDetails({ siteId }: { siteId: string }) {
  const { data, isLoading, error } = useSite(siteId);
  const updateSite = useUpdateSite();
  
  if (isLoading) return <div>Loading site...</div>;
  if (error) return <div>Error: {getErrorMessage(error)}</div>;
  if (!data) return null;
  
  const toggleActive = () => {
    updateSite.mutate({
      siteId,
      input: { isActive: !data.site.isActive },
    });
  };
  
  return (
    <div>
      <h2>{data.site.name}</h2>
      <p>URL: {data.site.url}</p>
      <p>Domain: {data.site.domain}</p>
      <p>Tracking ID: {data.site.siteId}</p>
      <p>Status: {data.site.isActive ? 'Active' : 'Inactive'}</p>
      <button onClick={toggleActive}>
        {data.site.isActive ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  );
}

// ============================================================================
// Metrics Examples
// ============================================================================

export function MetricsDashboard({ siteId }: { siteId: string }) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  
  const { data: summary, isLoading } = useMetricsSummary(siteId, { timeRange });
  
  if (isLoading) return <div>Loading metrics...</div>;
  if (!summary) return null;
  
  return (
    <div>
      <h2>Performance Summary</h2>
      
      <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
        <option value="24h">Last 24 Hours</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
      </select>
      
      <div>
        <h3>Average Metrics</h3>
        <p>LCP: {summary.summary.avgLcp.toFixed(0)}ms</p>
        <p>FID: {summary.summary.avgFid.toFixed(0)}ms</p>
        <p>CLS: {summary.summary.avgCls.toFixed(3)}</p>
      </div>
      
      <div>
        <h3>95th Percentile</h3>
        <p>LCP: {summary.summary.p95Lcp.toFixed(0)}ms</p>
        <p>FID: {summary.summary.p95Fid.toFixed(0)}ms</p>
        <p>CLS: {summary.summary.p95Cls.toFixed(3)}</p>
      </div>
      
      <p>Total Metrics: {summary.summary.count}</p>
    </div>
  );
}

export function MetricsTable({ siteId }: { siteId: string }) {
  const [filters, setFilters] = useState({
    timeRange: '7d' as '24h' | '7d' | '30d',
    deviceType: '',
    browserName: '',
  });
  
  const { data, isLoading, error } = useMetrics(siteId, filters);
  
  if (isLoading) return <div>Loading metrics...</div>;
  if (error) return <div>Error: {getErrorMessage(error)}</div>;
  if (!data) return null;
  
  return (
    <div>
      <h2>Metrics Data</h2>
      
      <div>
        <select
          value={filters.timeRange}
          onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
        
        <select
          value={filters.deviceType}
          onChange={(e) => setFilters({ ...filters, deviceType: e.target.value })}
        >
          <option value="">All Devices</option>
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
          <option value="tablet">Tablet</option>
        </select>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>LCP</th>
            <th>FID</th>
            <th>CLS</th>
            <th>Device</th>
            <th>Browser</th>
          </tr>
        </thead>
        <tbody>
          {data.metrics.map((metric) => (
            <tr key={metric.id}>
              <td>{new Date(metric.timestamp).toLocaleString()}</td>
              <td>{metric.lcp?.toFixed(0)}ms</td>
              <td>{metric.fid?.toFixed(0)}ms</td>
              <td>{metric.cls?.toFixed(3)}</td>
              <td>{metric.deviceType}</td>
              <td>{metric.browserName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Alert Management Examples
// ============================================================================

export function AlertsList() {
  const { data, isLoading, error } = useAlerts();
  const deleteAlert = useDeleteAlert();
  const updateAlert = useUpdateAlert();
  
  if (isLoading) return <div>Loading alerts...</div>;
  if (error) return <div>Error: {getErrorMessage(error)}</div>;
  if (!data) return null;
  
  const toggleAlert = (alertId: number, isActive: boolean) => {
    updateAlert.mutate({
      alertId,
      input: { isActive: !isActive },
    });
  };
  
  return (
    <div>
      <h2>My Alerts</h2>
      {data.alerts.length === 0 ? (
        <p>No alerts configured</p>
      ) : (
        <ul>
          {data.alerts.map((alert) => (
            <li key={alert.id}>
              <p>
                {alert.metricType.toUpperCase()} {alert.condition.replace('_', ' ')}{' '}
                {alert.threshold}
              </p>
              <p>Status: {alert.isActive ? 'Active' : 'Inactive'}</p>
              <button onClick={() => toggleAlert(alert.id, alert.isActive)}>
                {alert.isActive ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => deleteAlert.mutate(alert.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CreateAlertForm({ siteId }: { siteId: number }) {
  const [formData, setFormData] = useState({
    metricType: 'lcp' as 'lcp' | 'fid' | 'cls',
    threshold: 2500,
    condition: 'greater_than' as 'greater_than' | 'less_than',
  });
  
  const createAlert = useCreateAlert({
    onSuccess: () => {
      alert('Alert created successfully');
    },
    onError: (error) => {
      alert(`Failed to create alert: ${getErrorMessage(error)}`);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAlert.mutate({
      siteId,
      ...formData,
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <select
        value={formData.metricType}
        onChange={(e) => setFormData({ ...formData, metricType: e.target.value as any })}
      >
        <option value="lcp">LCP (Largest Contentful Paint)</option>
        <option value="fid">FID (First Input Delay)</option>
        <option value="cls">CLS (Cumulative Layout Shift)</option>
      </select>
      
      <select
        value={formData.condition}
        onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
      >
        <option value="greater_than">Greater Than</option>
        <option value="less_than">Less Than</option>
      </select>
      
      <input
        type="number"
        value={formData.threshold}
        onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
        placeholder="Threshold"
        required
      />
      
      <button type="submit" disabled={createAlert.isPending}>
        {createAlert.isPending ? 'Creating...' : 'Create Alert'}
      </button>
    </form>
  );
}
