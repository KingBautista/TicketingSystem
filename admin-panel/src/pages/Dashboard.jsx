import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../utils/solidIcons';

export default function Dashboard() {
	return (
    <div className="card mb-2">
      <div className="card-header">
        <h4>
          <FontAwesomeIcon icon={solidIconMap.home} className="me-2" />
          Dashboard
        </h4>
      </div>
    </div>
	)
}