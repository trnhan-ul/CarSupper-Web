import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { URL_IMG } from "../../utils/constant";
import {
  getUserById,
  updateUser,
  changePassword,
  updateStatusUser,
} from "../../api/userApi";
import { logout } from "../../api/authApi";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("profile");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [profileData, setProfileData] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    gender: user.gender || "",
    address: user.address || "",
    avatar: user.avatar || "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user?._id) {
      toast.error("Please log in to view your profile.");
      navigate("/login");
    } else {
      fetchUserProfile();
    }
  }, [navigate]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const userData = await getUserById(user._id);
      setProfileData({
        fullName: userData.fullName,
        phone: userData.phone || "",
        gender: userData.gender || "",
        address: userData.address || "",
        avatar: userData.avatar || "",
      });
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!profileData.fullName || profileData.fullName.trim() === "") {
        toast.error("Full name cannot be empty.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("fullName", profileData.fullName);
      formData.append("phone", profileData.phone || "");
      formData.append("gender", profileData.gender || "");
      formData.append("address", profileData.address || "");

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const updatedUser = await updateUser(user._id, formData);
      setProfileData(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
      setSelectedFile(null);
      setViewMode("profile");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        userId: user._id
      });
      toast.success("Password updated successfully!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setViewMode("profile");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateStatusUser(user._id, {
        status: "inactive",
        password: passwordData.confirmPassword,
      });
      toast.success("Your account has been blocked successfully!");
      await logout(navigate);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpdate = () => {
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    setProfileData({
      fullName: currentUser.fullName || "",
      phone: currentUser.phone || "",
      gender: currentUser.gender || "",
      address: currentUser.address || "",
      avatar: currentUser.avatar || "",
    });
    setSelectedFile(null);
    setViewMode("profile");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '600px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '20px', fontSize: '1.1rem', color: '#6c757d' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '600px',
      paddingTop: '40px',
      paddingBottom: '40px',
      backgroundColor: '#f8f9fa'
    },
    profileCard: {
      border: 'none',
      borderRadius: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    avatarSection: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      textAlign: 'center',
      color: 'white'
    },
    avatarImage: {
      width: '150px',
      height: '150px',
      objectFit: 'cover',
      border: '5px solid white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      marginBottom: '20px'
    },
    infoSection: {
      padding: '30px'
    },
    infoItem: {
      padding: '15px',
      marginBottom: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      borderLeft: '4px solid #667eea'
    },
    label: {
      fontSize: '0.85rem',
      color: '#6c757d',
      marginBottom: '5px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    value: {
      fontSize: '1.1rem',
      color: '#212529',
      fontWeight: '500'
    },
    buttonGroup: {
      marginTop: '30px'
    },
    button: {
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      fontSize: '0.9rem',
      letterSpacing: '0.5px',
      border: 'none'
    },
    formCard: {
      border: 'none',
      borderRadius: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      padding: '40px'
    },
    formTitle: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#212529',
      marginBottom: '30px',
      textAlign: 'center',
      borderBottom: '3px solid #667eea',
      paddingBottom: '15px'
    }
  };

  return (
    <div style={styles.container}>
      <Container className="mb-4">
        <Row className="justify-content-center">
          {viewMode === "profile" ? (
            <Col lg={10}>
              <Card style={styles.profileCard}>
                <Row className="g-0">
                  <Col md={4} style={styles.avatarSection}>
                    <img
                      src={`${URL_IMG}${profileData.avatar}`}
                      alt="Profile Avatar"
                      className="rounded-circle"
                      style={styles.avatarImage}
                    />
                    <h4 style={{ marginBottom: '10px', fontWeight: '700' }}>
                      {profileData.fullName}
                    </h4>
                    <p style={{ fontSize: '0.9rem', opacity: '0.9' }}>
                      {user.email}
                    </p>
                    <div style={styles.buttonGroup}>
                      <Button
                        variant="light"
                        className="w-100 mb-2"
                        style={{ ...styles.button, backgroundColor: 'white', color: '#667eea' }}
                        onClick={() => setViewMode("updateProfile")}
                        disabled={loading}
                      >
                        ✏️ Update Profile
                      </Button>
                      <Button
                        variant="light"
                        className="w-100 mb-2"
                        style={{ ...styles.button, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        onClick={() => setViewMode("changePassword")}
                        disabled={loading}
                      >
                        🔒 Change Password
                      </Button>
                      <Button
                        variant="light"
                        className="w-100"
                        style={{ ...styles.button, backgroundColor: 'rgba(220,53,69,0.8)', color: 'white' }}
                        onClick={() => setViewMode("blockaccount")}
                        disabled={loading}
                      >
                        🚫 Block Account
                      </Button>
                    </div>
                  </Col>
                  <Col md={8} style={styles.infoSection}>
                    <h3 style={{ marginBottom: '30px', fontWeight: '700', color: '#212529' }}>
                      Personal Information
                    </h3>
                    <div style={styles.infoItem}>
                      <div style={styles.label}>📱 Phone Number</div>
                      <div style={styles.value}>{profileData.phone || "Not provided"}</div>
                    </div>
                    <div style={styles.infoItem}>
                      <div style={styles.label}>👤 Gender</div>
                      <div style={styles.value}>{profileData.gender || "Not provided"}</div>
                    </div>
                    <div style={styles.infoItem}>
                      <div style={styles.label}>📍 Address</div>
                      <div style={styles.value}>{profileData.address || "Not provided"}</div>
                    </div>
                    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '10px', borderLeft: '4px solid #0d6efd' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#084298' }}>
                        <strong>💡 Tips:</strong> Keep your profile information up-to-date to ensure smooth car purchasing and delivery experience.
                      </p>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          ) : (
            <Col lg={6} md={8}>

              <Card style={styles.formCard}>
                {/* Form cập nhật thông tin cá nhân */}
                {viewMode === "updateProfile" && (
                  <>
                    <h3 style={styles.formTitle}>✏️ Update Profile</h3>
                    <div className="text-center mb-4">
                      <img
                        src={
                          selectedFile
                            ? URL.createObjectURL(selectedFile)
                            : `${URL_IMG}${profileData.avatar}`
                        }
                        alt="Profile Avatar"
                        className="rounded-circle"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          border: "5px solid #667eea",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                        }}
                      />
                    </div>
                    <Form onSubmit={handleUpdateProfile}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                          👤 Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          style={{ padding: '12px', borderRadius: '8px' }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                          📱 Phone
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleChange}
                          disabled={loading}
                          style={{ padding: '12px', borderRadius: '8px' }}
                          pattern="[0-9]{10,11}"
                          maxLength="11"
                          title="Phone number must be 10-11 digits"
                          placeholder="Enter 10-11 digit phone number"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                          ⚧️ Gender
                        </Form.Label>
                        <Form.Select
                          name="gender"
                          value={profileData.gender}
                          onChange={handleChange}
                          disabled={loading}
                          style={{ padding: '12px', borderRadius: '8px' }}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                          📍 Address
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleChange}
                          disabled={loading}
                          style={{ padding: '12px', borderRadius: '8px' }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                          📷 Avatar
                        </Form.Label>
                        <Form.Control
                          type="file"
                          onChange={handleFileChange}
                          disabled={loading}
                          style={{ padding: '12px', borderRadius: '8px' }}
                        />
                      </Form.Group>
                      <Button
                        type="submit"
                        className="w-100 mb-2"
                        disabled={loading}
                        style={{
                          ...styles.button,
                          backgroundColor: '#667eea',
                          color: 'white'
                        }}
                      >
                        💾 Save Changes
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-100"
                        onClick={handleCancelUpdate}
                        disabled={loading}
                        style={styles.button}
                      >
                        ❌ Cancel
                      </Button>
                    </Form>
                  </>
                )}

                {/* Form thay đổi mật khẩu */}
                {viewMode === "changePassword" && (
                  <>
                    <h3 style={styles.formTitle}>🔒 Change Password</h3>
                    <div className="text-center mb-4">
                      <img
                        src={`${URL_IMG}${profileData.avatar}`}
                        alt="Profile Avatar"
                        className="rounded-circle"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          border: "5px solid #667eea",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                        }}
                      />
                    </div>
                    <Form onSubmit={handleChangePassword}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                          🔐 Current Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          required
                          disabled={loading}
                          style={{ padding: '12px', borderRadius: '8px' }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                          🔑 New Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          disabled={loading}
                          style={{ padding: '12px', borderRadius: '8px' }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                          ✅ Confirm Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          disabled={loading}
                          style={{ padding: '12px', borderRadius: '8px' }}
                        />
                      </Form.Group>
                      <Button
                        type="submit"
                        variant="warning"
                        className="w-100 mb-2"
                        disabled={loading}
                        style={{ ...styles.button, fontWeight: '700' }}
                      >
                        🔄 Update Password
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => setViewMode("profile")}
                        disabled={loading}
                        style={styles.button}
                      >
                        ❌ Cancel
                      </Button>
                    </Form>
                  </>
                )}

                {/* Form khóa tài khoản */}
                {viewMode === "blockaccount" && (
                  <>
                    <h3 style={styles.formTitle}>🚫 Confirm Block Account</h3>
                    <div className="text-center mb-4">
                      <img
                        src={`${URL_IMG}${profileData.avatar}`}
                        alt="Profile Avatar"
                        className="rounded-circle"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          border: "5px solid #dc3545",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                        }}
                      />
                    </div>
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '10px',
                      borderLeft: '4px solid #ffc107',
                      marginBottom: '20px'
                    }}>
                      <p style={{ margin: 0, color: '#856404', fontWeight: '600' }}>
                        ⚠️ Warning: This action will block your account. You won't be able to access the platform until an administrator unblocks it.
                      </p>
                    </div>
                    <Form onSubmit={handleBlockAccount}>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                          🔐 Enter Password to Confirm
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          disabled={loading}
                          style={{ padding: '12px', borderRadius: '8px' }}
                        />
                      </Form.Group>
                      <Button
                        type="submit"
                        variant="danger"
                        className="w-100 mb-2"
                        disabled={loading}
                        style={{ ...styles.button, fontWeight: '700' }}
                      >
                        ⛔ Confirm Block
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => setViewMode("profile")}
                        disabled={loading}
                        style={styles.button}
                      >
                        ❌ Cancel
                      </Button>
                    </Form>
                  </>
                )}
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;
