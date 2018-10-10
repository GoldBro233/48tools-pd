import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';

const ModuleLayout: Function = (props: Object): React.Element=>{
  return (
    <Switch>
      <Route path="/" component={ Index } exact={ true } />
    </Switch>
  );
};

export default ModuleLayout;