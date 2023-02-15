const express = require('express');

const app = express();

const userRoutes = require('./modules/v1/user/userRoute');
const organizationRoutes = require('./modules/v1/organization/organizationRoute');
const adminRoutes = require('./modules/v1/admin/adminRoute');
const workspaceRoutes = require('./modules/v1/workspace/workspaceRoute');
const applicationRoutes = require('./modules/v1/application/applicationRoute');
const recordRoutes = require('./modules/v1/record/recordRoute');
const marketRoutes = require('./modules/v1/market-workspace/market-workspaceRoute');
const taskRoutes = require('./modules/v1/task/taskRoute');
const categoryRoutes = require('./modules/v1/category/categoryRoute');
const viewRoutes=require('./modules/v1/views/viewRoute');
const homeRoutes=require('./modules/v1/home/homeRoute');
const subscriptionsRoutes=require('./modules/v1/subscriptions/subscriptionsRoute');

app.use('/user', userRoutes);
app.use('/organization', organizationRoutes);
app.use('/workspace', workspaceRoutes);
app.use('/admin', adminRoutes);
app.use('/application', applicationRoutes);
app.use('/record',recordRoutes);
app.use('/category',categoryRoutes);
app.use('/task',taskRoutes);
app.use('/view',viewRoutes);
app.use('/market-workspaces',marketRoutes);
app.use('/home',homeRoutes);
app.use('/subscriptions',subscriptionsRoutes);
module.exports = app
