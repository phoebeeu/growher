# 推进 v2 数据模型草案

日期：2026-08-15  
用途：为实现提供字段和约束方向；不是最终 SQL。

## 1. 核心实体

### Project

一个用户的一个项目。建议字段：`id`、`user_id`、`title`、`artifact_type`、`total_units`、`unit_label`、`cycle_days`、`status`、`started_at`、`target_end_date`、`pregnancy_week_at_start`。

`status`：`draft`、`active`、`paused`、`ended`。同一 `user_id` 只能有一个 `active` 项目。

### ProjectContract

项目某一版本的承诺。字段：`project_id`、`version`、`quality_standard`、`standard_action`、`minimum_action`、`daily_minutes`、`meeting_time`、`buffer_days`、`buffer_days_used`、`reminder_channel`、`confirmed_at`。

重新签订契约时创建新版本，不覆盖历史版本。

### ProjectStage / DailyPlan / DailySession / ProgressCell

- `ProjectStage`：阶段名称、顺序、日期、目标单位和状态。
- `DailyPlan`：日期、阶段、计划单位、计划分钟、时段、是否缓冲日；只生成未来 7 天的详细记录。
- `DailySession`：日期、状态、行动档位、开始/完成时间、备注、照片和作品链接。
- `ProgressCell`：项目单位序号、日期、完成等级、来源会面和里程碑。

`DailySession.state`：`normal`、`light`、`rest`；`action_level`：`standard`、`minimum`、`none`。  
`ProgressCell.completion_level`：`standard`、`minimum`、`rest`、`buffer`。

## 2. 关键约束

1. 所有实体都通过用户关系校验归属；active 项目必须数据库级唯一。
2. 契约重新签订时创建新版本，不覆盖历史。
3. 日期按用户时区计算，不能直接用服务器 UTC 判断“今天”。
4. 标准完成和最低完成都点亮成果格，但视觉层级不同。
5. 休息日不生成负向格，不打断 streak，只记入缓冲消耗。
6. 错过执行日时从剩余缓冲重新安排，不复制逾期任务。
7. 缓冲耗尽后保留成果，并允许延期、降量或结束当前版本。
8. 附件可选，只存外部 URL，不抓取第三方内容。

## 3. API 边界

`createProjectDraft`、`validateProjectContract`、`confirmProjectContract`、`getProjectHome`、`recordDailyState`、`completeDailyAction`、`pauseProject`、`endProjectVersion`、`getProgressBoard`、`createProjectExport`。

AI 只负责生成建议和检查，不直接写入已确认契约或移动固定内容。
