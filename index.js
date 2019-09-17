import React, { Component } from 'react';
import validate from 'validate.js';
import { Form, Input } from 'antd';

import './styles.css';

export default class InputUrl extends Component {
	state = { errors: [] };

	onChange = async value => {
		const { id, onChange, onValidate } = this.props;

		onChange(id, value);
		const errors = this.validate(value);
		await this.setState({ errors });
		if (onValidate) onValidate(id, errors);
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

	renderInput() {
		const {
			disabled = false,
			id,
			label = '',
			onBlur = () => {},
			onPressEnter = () => {},
			placeholder = '',
			styles = {},
			value = ''
		} = this.props;

		return (
			<Input
				allowClear
				autoComplete="off"
				disabled={disabled}
				name={id}
				placeholder={placeholder || label || id}
				style={styles}
				type="text"
				onBlur={onBlur}
				onChange={e => this.onChange(e.target.value)}
				onPressEnter={onPressEnter}
				value={value ? value : ''}
			/>
		);
	}

	render() {
		const { errors } = this.state;
		const { label = '', required = false, withLabel = false } = this.props;

		const formItemCommonProps = {
			colon: false,
			help: errors.length != 0 ? errors[0] : '',
			label: withLabel ? label : false,
			required,
			validateStatus: errors.length != 0 ? 'error' : 'success'
		};

		return <Form.Item {...formItemCommonProps}>{this.renderInput()}</Form.Item>;
	}
}
