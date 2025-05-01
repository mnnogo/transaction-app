import React from 'react';

import styles from './ProfileCard.module.css';

const ProfileCard = ({ user }) => {
  return (
    <div className={styles.profileCard}>
      <AvatarEdit avatar={user.avatar} />
      <h2>{user.name}</h2>
      
      <InfoBlock label="Email" value={user.email} />
      <InfoBlock label="Номер телефона" value={user.phone} />
      <InfoBlock label="Пол" value={user.gender} />
      
      <button className={styles.resetPassword}>
        Сброс пароля
      </button>
    </div>
  );
};

export default ProfileCard;