import React, { Component, Fragment } from 'react';
import validate from 'validate.js';
import { Form, Input, message, Tag, Tooltip } from 'antd';
import { TweenOneGroup } from 'rc-tween-one';

import './styles.css';

export default class InputUrl extends Component {
	state = { errors: [], action: 'add', url: '', urlIndex: 0 };

	onChangeTimeout = null;
	onChange = async (e, value) => {
		const { id, onChange, onValidate } = this.props;

		onChange(e, id, value);

		this.onChangeTimeout && clearTimeout(this.onChangeTimeout);
		this.onChangeTimeout = setTimeout(async () => {
			const errors = this.validate(value);
			await this.setState({ errors });
			if (onValidate) onValidate(id, errors);
		}, 500);
	};

	validate = value => {
		const { id, required = false } = this.props;

		const constraints = {
			[id]: {
				presence: { allowEmpty: !required },
				url: {
					allowLocal: true
				}
			}
		};

		const errors = validate({ [id]: value }, constraints);
		return validate.isEmpty(value) && !required ? [] : errors ? errors[id] : [];
	};

	handleChange = async e => {
		const { id, onValidate } = this.props;

		await this.setState({ url: e.target.value });

		this.onChangeTimeout && clearTimeout(this.onChangeTimeout);
		this.onChangeTimeout = setTimeout(async () => {
			const errors = this.validate(this.state.url);
			await this.setState({ errors });
			if (onValidate) onValidate(id, errors);
		}, 500);
	};

	handlePressEnter = () => {
		const { url, action, urlIndex } = this.state;
		const { id, onChange, value = [] } = this.props;

		let errors = {},
			urlList = Array.isArray(value) ? [...value] : value.split(',');
		switch (action) {
			case 'add':
				errors = this.validate(url);
				if (url === '') return message.error('Please enter a url');
				if (errors.length) return message.error('Cannot add invalid url.');

				onChange({ target: { name: id, value: [...urlList, url] } }, id, [...urlList, url]);
				this.setState({ url: '' });
				break;
			case 'edit':
				errors = this.validate(url);
				if (url === '') return message.error('Please enter a url');
				if (errors.length) return message.error('Cannot edit invalid url.');

				const newValue = urlList.map((d, index) => {
					if (index === urlIndex) d = url;
					return d;
				});

				onChange({ target: { name: id, value: [...newValue] } }, id, [...newValue]);
				this.setState({ url: '', action: 'add' });
				break;
		}
	};

	handleOnClick = (val, index) => {
		const { action } = this.state;

		if (action !== 'edit') {
			setTimeout(() => this.setState({ action: 'edit', url: val, urlIndex: index }), 250);
		} else {
			setTimeout(() => this.setState({ action: 'add', url: '', urlIndex: 0 }), 250);
		}
	};

	removeUrl = url => {
		const { id, onChange, value = [] } = this.props;

		const filteredValue = value.filter(val => val !== url);
		onChange({ target: { name: id, value: [...filteredValue] } }, id, filteredValue);
		setTimeout(() => this.setState({ url: '', action: 'add' }), 500);
	};

	renderInput() {
		const {
			disabled = false,
			id,
			label = '',
			multiple = false,
			onBlur = () => {},
			onPressEnter = () => {},
			placeholder = '',
			styles = {}
		} = this.props;

		if (multiple) {
			const { url, urlIndex, action } = this.state;
			const { value = [] } = this.props;
			const urlList = Array.isArray(value) && value.length ? [...value] : value.length ? value.split(',') : [];

			const tagChild = urlList.map((d, i) => {
				const tagElem = (
					<Tooltip
						title={`${
							action === 'add'
								? 'Click to edit url'
								: action === 'edit' && urlIndex === i
								? 'Click to cancel edit'
								: 'Click to edit url'
						}`}
						placement="top">
						<Tag
							color={
								action === 'add' ? '#2db7f5' : action === 'edit' && urlIndex === i ? '#f50' : '#2db7f5'
							}
							closable={true}
							style={{ cursor: 'pointer' }}
							onClick={() => this.handleOnClick(d, i)}
							onClose={e => this.removeUrl(d)}>
							{action === 'add' ? d : action === 'edit' && urlIndex === i ? `(Editing) ${d}` : d}
						</Tag>
					</Tooltip>
				);
				return (
					<span key={`${d}-${i}`} style={{ display: 'inline-block' }}>
						{tagElem}
					</span>
				);
			});

			return (
				<Fragment>
					<TweenOneGroup
						enter={{ scale: 0.8, opacity: 0, type: 'from', duration: 100 }}
						leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
						appear={false}>
						{tagChild}
					</TweenOneGroup>
					<Tooltip title={`Press Enter to ${action} a URL`} placement="bottom" trigger="focus">
						<Input
							autoComplete="off"
							disabled={disabled}
							name={id}
							placeholder={placeholder || label || id}
							style={styles}
							type="url"
							onBlur={onBlur}
							onChange={this.handleChange}
							onPressEnter={this.handlePressEnter}
							value={url}
						/>
					</Tooltip>
				</Fragment>
			);
		}

		const { value = '' } = this.props;

		return (
			<Input
				autoComplete="off"
				disabled={disabled}
				name={id}
				placeholder={placeholder || label || id}
				style={{ width: '100%', ...styles }}
				type="text"
				onBlur={onBlur}
				onChange={e => this.onChange(e, e.target.value)}
				onPressEnter={onPressEnter}
				value={value ? value : ''}
			/>
		);
	}

	render() {
		const { errors } = this.state;
		const { extra = null, label = '', required = false, withLabel = false } = this.props;

		const formItemCommonProps = {
			colon: false,
			help: errors.length != 0 ? errors[0] : '',
			label: withLabel ? (
				<>
					<div style={{ float: 'right' }}>{extra}</div> <span class="label">{label}</span>
				</>
			) : (
				false
			),
			required,
			validateStatus: errors.length != 0 ? 'error' : 'success'
		};

		return <Form.Item {...formItemCommonProps}>{this.renderInput()}</Form.Item>;
	}
}
